import 'server-only';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

// Must match a redirect URI registered on the Google Cloud Console OAuth client.
// Set GOOGLE_REDIRECT_URI explicitly in production; otherwise it is derived from
// the incoming request's origin (handy for localhost).
export function googleRedirectUri(requestUrl: string): string {
  return process.env['GOOGLE_REDIRECT_URI'] || new URL('/api/auth/google/callback', requestUrl).toString();
}

export function buildGoogleAuthUrl(params: { clientId: string; redirectUri: string; state: string }): string {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', params.state);
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

export async function exchangeGoogleCode(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: params.code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

interface GoogleUserinfo {
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export async function fetchGoogleUserinfo(accessToken: string): Promise<GoogleUserinfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo fetch failed: ${res.status}`);
  }
  return (await res.json()) as GoogleUserinfo;
}
