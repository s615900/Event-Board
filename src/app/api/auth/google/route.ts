import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/server/logger';
import { buildGoogleAuthUrl, googleRedirectUri } from '@/server/google-oauth';
import { setStateCookie } from '@/server/session';

export function GET(request: NextRequest) {
  const clientId = process.env['GOOGLE_CLIENT_ID'];
  if (!clientId) {
    logger.error('GOOGLE_CLIENT_ID is not configured');
    return new Response('GOOGLE_CLIENT_ID is not configured', { status: 500 });
  }
  const state = crypto.randomBytes(16).toString('hex');
  const response = NextResponse.redirect(
    buildGoogleAuthUrl({ clientId, redirectUri: googleRedirectUri(request.url), state }),
  );
  setStateCookie(response, state);
  return response;
}
