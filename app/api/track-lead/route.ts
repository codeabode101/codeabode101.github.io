import { NextResponse } from 'next/server';
import crypto from 'crypto';

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/rahejaom@outlook.com';
const D1_API_BASE = 'https://api.cloudflare.com/client/v4/accounts/0bfab51e8cc50b91033dc21005e8cabc/d1/database/1ee9fbde-05f0-42de-a8ba-b5bfff43fbec';
const BDC_API_BASE = 'https://api-bdc.net/data/phone-number-validate';

function sha256Value(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizePhone(phone: string): string {
  return String(phone || '').replace(/[^\d]/g, '');
}

async function validatePhoneWithBDC(phone: string, apiKey: string): Promise<{valid: boolean; lineType: string; countryCode: string; internationalFormat: string}> {
  try {
    const url = `${BDC_API_BASE}?number=${encodeURIComponent(phone)}&countryCode=IN&localityLanguage=en&key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    
    if (response.status === 429 || response.status === 403) {
      console.log('BDC rate limited, continuing anyway');
      return { valid: true, lineType: 'UNKNOWN', countryCode: '', internationalFormat: phone };
    }
    
    const data = await response.json();
    return {
      valid: data.isValid ?? false,
      lineType: data.lineType ?? 'UNKNOWN',
      countryCode: data.country?.isoAlpha2 ?? '',
      internationalFormat: data.internationalFormat ?? phone
    };
  } catch (err) {
    console.error('BDC validation error:', err);
    return { valid: true, lineType: 'ERROR', countryCode: '', internationalFormat: phone };
  }
}

export const runtime = 'nodejs';

async function insertLeadToD1(
  parentFirstName: string, parentLastName: string,
  studentFirstName: string, studentLastName: string,
  age: string | number, parentNumber: string,
  studentExperience: number | null, studentGoals: string | null,
  demoDatetime: string | null,
  message: string | null, contact: string | null, sourceUrl: string | null,
  eventId: string, fbc: string | null
) {
  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;
  if (!apiToken) {
    console.log('No D1 token configured');
    return false;
  }

  try {
    const response = await fetch(`${D1_API_BASE}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        params: [
          parentFirstName, parentLastName, studentFirstName, studentLastName,
          age ? parseInt(String(age)) : null, parentNumber,
          studentExperience, studentGoals, demoDatetime,
          message, contact, sourceUrl, eventId, fbc, eventId, 0, null
        ],
        sql: `INSERT INTO leads (parent_first_name, parent_last_name, student_first_name, student_last_name, age, parent_number, student_experience, student_goals, demo_datetime, message, contact, source_url, event_id, fbc, meta_event_id, meta_success, meta_error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      }),
    });

    const result = await response.json();
    console.log('D1 insert result:', result);
    return result.success;
  } catch (err) {
    console.error('D1 insert error:', err);
    return false;
  }
}

async function updateLeadInD1(eventId: string, metaSuccess: number, metaError: string | null) {
  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;
  if (!apiToken) return false;

  try {
    const response = await fetch(`${D1_API_BASE}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        params: [metaSuccess, metaError, eventId],
        sql: `UPDATE leads SET meta_success = ?, meta_error = ? WHERE event_id = ?`
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (err) {
    console.error('D1 update error:', err);
    return false;
  }
}

export async function POST(request: Request) {
  const apiToken = process.env.CLOUDFLARE_D1_TOKEN;
  const bdcToken = process.env.BIGDATA_CLOUD_KEY;
  
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

  const { parent_first_name, parent_last_name, student_first_name, student_last_name, age, parent_number, message, contact, sourceUrl, event_id, fbc } = formData;

  if (!parent_first_name || !parent_last_name || !student_first_name || !student_last_name || !age || !parent_number) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const phone = normalizePhone(parent_number as string);

  if (!phone || phone.length < 10) {
    return NextResponse.json({ ok: false, error: 'Invalid phone number' }, { status: 400 });
  }

  // Validate phone with BigDataCloud
  let phoneValid = true;
  let phoneLineType = 'UNKNOWN';
  if (bdcToken) {
    const bdcResult = await validatePhoneWithBDC(phone, bdcToken);
    phoneValid = bdcResult.valid;
    phoneLineType = bdcResult.lineType;
    console.log('BDC validation:', phone, phoneValid, phoneLineType);
    if (!phoneValid) {
      return NextResponse.json({ ok: false, error: 'Invalid phone number' }, { status: 400 });
    }
  }

  // Extract new fields
  const studentExperience = formData.student_experience ? parseInt(String(formData.student_experience)) : null;
  const studentGoals = Array.isArray(formData.student_goals) ? (formData.student_goals as string[]).join(', ') : (formData.student_goals as string | null);
  const demoDatetime = (formData.demo_datetime as string | null) || null;

  const eventId = (event_id as string) || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // Save lead to D1 using HTTP API
  const d1Success = await insertLeadToD1(
    parent_first_name as string,
    parent_last_name as string,
    student_first_name as string,
    student_last_name as string,
    age as string,
    parent_number as string,
    studentExperience,
    studentGoals,
    demoDatetime,
    message as string | null,
    contact as string | null,
    sourceUrl as string | null,
    eventId,
    fbc as string | null
  );

  const user_data: Record<string, unknown> = {
    ph: sha256Value(phone)
  };

  // Extract fbc from URL param or cookie (cookie is more reliable for returning users)
  const cookieHeader = request.headers.get('cookie') || '';
  const getCookieValue = (cookies: string, name: string): string | undefined => {
    const match = cookies.match(new RegExp(`(?:^|;)\\s*${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  const cookieFbc = getCookieValue(cookieHeader, '_fbc');
  const finalFbc = (fbc && typeof fbc === 'string' && fbc.startsWith('fb')) ? fbc : (cookieFbc || null);
  if (finalFbc) {
    user_data.fbc = finalFbc;
  }

  // Extract fbp (browser ID) from _fbp cookie
  const fbp = getCookieValue(cookieHeader, '_fbp');
  if (fbp) {
    user_data.fbp = fbp;
  }

  // Add IP address and user agent for match quality
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  if (ip) {
    user_data.client_ip_address = ip.split(',')[0].trim();
  }
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent) {
    user_data.client_user_agent = userAgent;
  }

  // Generate or retrieve external_id from persistent cookie
  let externalId = getCookieValue(cookieHeader, '_external_id');
  if (!externalId) {
    externalId = sha256Value(`${phone}-${Date.now()}`);
  }
  user_data.external_id = externalId;

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
  if (d1Success) {
    await updateLeadInD1(eventId, facebookResult?.events_received ? 1 : 0, facebookResult?.messages?.length > 0 ? JSON.stringify(facebookResult.messages) : null);
  }

  if (!formsubmitOk) {
    const errorResponse = NextResponse.json(
      { ok: false, error: 'Form submission failed', detail: String(formsubmitResponse.reason), meta: facebookOk ? facebookResult : null },
      { status: 502 }
    );
    if (!getCookieValue(cookieHeader, '_external_id')) {
      errorResponse.cookies.set('_external_id', externalId, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }
    return errorResponse;
  }

  // Build response and set external_id cookie
  const responseJson = {
    ok: true,
    eventId,
    facebook: facebookResult,
    facebookOk,
    d1: d1Success
  };

  const response = NextResponse.json(responseJson);
  if (!getCookieValue(cookieHeader, '_external_id')) {
    response.cookies.set('_external_id', externalId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }

  return response;
}

export function GET() {
  return NextResponse.json({ status: 'ok', message: 'API running' });
}