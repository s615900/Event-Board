import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/server/logger';
import { exchangeGoogleCode, fetchGoogleUserinfo, googleRedirectUri } from '@/server/google-oauth';
import { completeLogin } from '@/server/login';
import { clearStateCookie, readStateCookie } from '@/server/session';

export async function GET(request: NextRequest) {
  const response = await handleCallback(request);
  clearStateCookie(response);
  return response;
}

async function handleCallback(request: NextRequest): Promise<NextResponse> {
  const query = request.nextUrl.searchParams;
  const expectedState = readStateCookie(request);
  const toLogin = (error: string) => NextResponse.redirect(new URL(`/admin/login?error=${error}`, request.url));

  if (query.get('error')) {
    logger.warn({ error: query.get('error') }, 'Google OAuth returned an error');
    return toLogin('google_error');
  }
  const code = query.get('code');
  const state = query.get('state');
  if (!code || !state || !expectedState) {
    logger.warn(
      { hasCode: Boolean(code), hasState: Boolean(state), hasCookie: Boolean(expectedState) },
      'Google OAuth callback missing code/state/cookie',
    );
    return toLogin('no_state');
  }
  if (state !== expectedState) {
    logger.warn('Google OAuth callback state mismatch');
    return toLogin('state_mismatch');
  }

  const clientId = process.env['GOOGLE_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
  if (!clientId || !clientSecret) {
    logger.error('Google OAuth client credentials are not configured');
    return toLogin('missing_credentials');
  }

  let tokens;
  try {
    tokens = await exchangeGoogleCode({ code, clientId, clientSecret, redirectUri: googleRedirectUri(request.url) });
  } catch (err) {
    logger.error({ err }, 'Google OAuth token exchange failed');
    return toLogin('token_exchange_failed');
  }

  let userinfo;
  try {
    userinfo = await fetchGoogleUserinfo(tokens.access_token);
  } catch (err) {
    logger.error({ err }, 'Google userinfo fetch failed');
    return toLogin('userinfo_failed');
  }
  if (!userinfo.email) {
    logger.error('Google userinfo response missing email');
    return toLogin('userinfo_failed');
  }

  return completeLogin(userinfo.email, userinfo.name ?? userinfo.email, request.url);
}
