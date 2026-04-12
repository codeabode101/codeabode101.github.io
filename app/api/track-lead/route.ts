import { NextResponse } from 'next/server';
import crypto from 'crypto';

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/rahejaom@outlook.com';

export const runtime = 'nodejs';

function sha256Value(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizePhone(phone: string): string {
  return String(phone || '').replace(/[^\d]/g, '');
}

export async function POST(request: Request, context: any) {
  const env = context?.env || (typeof global !== 'undefined' ? (global as any).__env__ : undefined) || {};
  const hasD1 = !!env.LEADS_DB;
  
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return NextResponse.json(
      { ok: false, error: 'Missing META_PIXEL_ID or META_ACCESS_TOKEN' },
      { status: 500 }
    );
  }

  let formData: Record<string, unknown>;
  try {
    formData = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, age, parent_number, message, contact, sourceUrl, event_id, fbc } = formData;

  if (!name || !age || !parent_number) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const phone = normalizePhone(parent_number as string);

  if (!phone || phone.length < 10) {
    return NextResponse.json({ ok: false, error: 'Invalid phone number' }, { status: 400 });
  }

  const eventId = (event_id as string) || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // Save lead to D1 first
  let d1Success = false;
  console.log('D1 check - has LEADS_DB:', hasD1, 'env keys:', env ? Object.keys(env) : 'none');
  if (env.LEADS_DB) {
    try {
      const insertResult = await env.LEADS_DB.prepare(`
        INSERT INTO leads (name, age, parent_number, message, contact, source_url, event_id, fbc, meta_event_id, meta_success, meta_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
      `).bind(
        name as string,
        age ? parseInt(age as string) : null,
        parent_number as string,
        (message as string) || null,
        (contact as string) ? JSON.stringify(contact) : null,
        (sourceUrl as string) || null,
        eventId,
        (fbc as string) || null,
        eventId
      ).run();
      d1Success = insertResult.success;
    } catch (e) {
      console.error('D1 insert error:', e);
    }
  }

  const user_data: Record<string, unknown> = {
    ph: [sha256Value(phone)]
  };
  
  if (fbc && typeof fbc === 'string' && fbc.startsWith('fb')) {
    user_data.fbc = fbc;
  }

  const facebookBody = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl || '',
      action_source: 'website',
      user_data,
      custom_data: {
        content_name: 'Free Demo Signup',
        age: age ? String(age) : undefined
      }
    }]
  };

  const testEventCode = process.env.META_TEST_EVENT_CODE;
  if (testEventCode) (facebookBody as any).test_event_code = testEventCode;

  const facebookUrl = `https://graph.facebook.com/v18.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

  const [facebookResponse, formsubmitResponse] = await Promise.allSettled([
    fetch(facebookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facebookBody)
    }).then(r => r.json().catch(() => null)),
    fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://codeabode.com',
        'Referer': 'https://codeabode.com/signup'
      },
      body: JSON.stringify(formData)
    }).then(async r => {
      const text = await r.text();
      try { return JSON.parse(text); } catch { return { text }; }
    })
  ]);

  const facebookOk = facebookResponse.status === 'fulfilled';
  const facebookResult = facebookOk ? facebookResponse.value : null;
  const formsubmitOk = formsubmitResponse.status === 'fulfilled';

  // Update D1 with Meta result
  if (env.LEADS_DB && d1Success) {
    try {
      await env.LEADS_DB.prepare(`
        UPDATE leads SET meta_success = ?, meta_error = ? WHERE event_id = ?
      `).bind(
        facebookResult?.events_received ? 1 : 0,
        facebookResult?.messages?.length > 0 ? JSON.stringify(facebookResult.messages) : null,
        eventId
      ).run();
    } catch (e) {
      console.error('D1 update error:', e);
    }
  }

  if (!formsubmitOk) {
    return NextResponse.json(
      { ok: false, error: 'Form submission failed', detail: String(formsubmitResponse.reason), meta: facebookOk ? facebookResult : null },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    eventId,
    facebook: facebookResult,
    facebookOk,
    d1: d1Success
  });
}

export function GET() {
  return NextResponse.json({ status: 'ok', message: 'API running' });
}