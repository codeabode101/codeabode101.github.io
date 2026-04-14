import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (pixelId && accessToken) {
    const url = request.nextUrl.toString();
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const pathname = request.nextUrl.pathname;

    // Skip API routes, static files, and favicons
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff2?)$/)
    ) {
      return response;
    }

    // Extract cookies for advanced matching
    const cookieHeader = request.headers.get('cookie') || '';
    const getCookieValue = (cookies: string, name: string): string | undefined => {
      const match = cookies.match(new RegExp(`(?:^|;)\\s*${name}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : undefined;
    };

    const fbc = getCookieValue(cookieHeader, '_fbc');
    const fbp = getCookieValue(cookieHeader, '_fbp');
    const externalId = getCookieValue(cookieHeader, '_external_id');

    const userData: Record<string, string> = {
      client_ip_address: ip.split(',')[0].trim(),
      client_user_agent: userAgent
    };

    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;
    if (externalId) userData.external_id = externalId;

    const body: Record<string, any> = {
      data: [
        {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: url,
          action_source: 'website',
          user_data: userData
        }
      ]
    };

    if (testEventCode) body.test_event_code = testEventCode;

    const fbUrl = `https://graph.facebook.com/v18.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

    // Fire and forget
    fetch(fbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).catch(() => {});
  }

  return response;
}

export const config = {
  matcher: '/:path*'
};
