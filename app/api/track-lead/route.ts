import { NextResponse } from 'next/server';
import crypto from 'crypto';

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizePhone(phone: string) {
  return String(phone || '').replace(/[^\d]/g, '');
}

export async function POST(request: Request) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    return NextResponse.json(
      { ok: false, error: 'Missing META_PIXEL_ID or META_ACCESS_TOKEN' },
      { status: 500 }
    );
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if ((payload?.eventName || 'Lead') !== 'Lead') {
    return NextResponse.json({ ok: false, error: 'Unsupported eventName' }, { status: 400 });
  }

  const eventId = String(payload?.eventId || '');
  const sourceUrl = String(payload?.sourceUrl || '');
  const parentNumber = normalizePhone(String(payload?.formData?.parentNumber || ''));

  if (!parentNumber) {
    return NextResponse.json({ ok: false, error: 'Missing phone for user_data' }, { status: 400 });
  }

  const user_data: Record<string, any> = {
    ph: [sha256(parentNumber)]
  };

  const body: Record<string, any> = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || undefined,
        event_source_url: sourceUrl || undefined,
        action_source: 'website',
        user_data,
        custom_data: { content_name: 'Free Demo Signup' }
      }
    ]
  };

  if (testEventCode) body.test_event_code = testEventCode;

  const url = `https://graph.facebook.com/v18.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;
  const metaResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const metaJson = await metaResponse.json().catch(() => null);
  return NextResponse.json(
    { ok: metaResponse.ok, status: metaResponse.status, meta: metaJson },
    { status: metaResponse.ok ? 200 : 400 }
  );
}

