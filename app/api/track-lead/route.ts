import { NextResponse } from 'next/server';
import crypto from 'crypto';

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/rahejaom@outlook.com';

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

  let formData: Record<string, any>;
  try {
    formData = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    name,
    age,
    parent_number,
    message,
    contact,
    sourceUrl
  } = formData;

  const phone = normalizePhone(parent_number || '');

  if (!phone) {
    return NextResponse.json({ ok: false, error: 'Missing phone for user_data' }, { status: 400 });
  }

  const user_data: Record<string, any> = {
    ph: [sha256(phone)]
  };

  const eventId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // Send to Facebook CAPI
  const facebookBody: Record<string, any> = {
    data: [
      {
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
      }
    ]
  };

  if (testEventCode) facebookBody.test_event_code = testEventCode;

  const facebookUrl = `https://graph.facebook.com/v18.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

  // Run Facebook CAPI and FormSubmit in parallel
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
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    }).then(r => r.json().catch(() => null))
  ]);

  const facebookOk = facebookResponse.status === 'fulfilled';
  const formsubmitOk = formsubmitResponse.status === 'fulfilled' && formsubmitResponse.value?.success !== false;

  if (!formsubmitOk) {
    return NextResponse.json(
      { ok: false, error: 'Form submission failed', meta: facebookOk ? facebookResponse.value : null },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    eventId,
    facebook: facebookOk ? facebookResponse.value : null,
    facebookOk
  });
}

