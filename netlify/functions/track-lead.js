const crypto = require('crypto');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
  // Keep digits only, Meta expects E.164 ideally; we at least normalize.
  return String(phone || '').replace(/[^\d]/g, '');
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
    };
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing META_PIXEL_ID or META_ACCESS_TOKEN' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid JSON body' })
    };
  }

  const eventName = payload.eventName || 'Lead';
  if (eventName !== 'Lead') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Unsupported eventName' })
    };
  }

  const eventId = String(payload.eventId || '');
  const sourceUrl = String(payload.sourceUrl || payload.eventSourceUrl || '');
  const formData = payload.formData || {};

  const emailRaw = normalizeEmail(formData.email);
  const phoneRaw = normalizePhone(formData.parentNumber || formData.phone || formData.parent_number);

  // Require at least one user identifier for match quality.
  if (!emailRaw && !phoneRaw) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing email or phone for user_data' })
    };
  }

  const user_data = {
    client_ip_address: event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || undefined,
    client_user_agent: event.headers['user-agent'] || undefined
  };

  if (emailRaw) user_data.em = [sha256(emailRaw)];
  if (phoneRaw) user_data.ph = [sha256(phoneRaw)];

  const custom_data = {
    content_name: 'Free Demo Signup'
  };

  const capiBody = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || undefined,
        event_source_url: sourceUrl || undefined,
        action_source: 'website',
        user_data,
        custom_data
      }
    ]
  };

  if (testEventCode) {
    capiBody.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/v18.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

  let metaResponse;
  try {
    metaResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capiBody)
    });
  } catch (e) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Failed to reach Meta API' })
    };
  }

  const metaJson = await metaResponse.json().catch(() => null);

  return {
    statusCode: metaResponse.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: metaResponse.ok,
      status: metaResponse.status,
      meta: metaJson
    })
  };
};

