import 'server-only';
import crypto from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

export type Role = '管理者' | '編輯者' | '檢視者';

export const ROLES: Role[] = ['管理者', '編輯者', '檢視者'];

export interface SessionUser {
  email: string;
  name: string;
  role: Role;
}

export const SESSION_COOKIE_NAME = 'sb_session';
export const STATE_COOKIE_NAME = 'oauth_state';
const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;
const STATE_MAX_AGE_S = 5 * 60;

function sessionSecret(): string {
  const secret = process.env['SESSION_SECRET'];
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required but was not provided.');
  }
  return secret;
}

// Signed cookie value: `<base64url payload>.<base64url HMAC-SHA256>`, replacing
// cookie-parser's signed cookies from the Express server.
function sign(value: string): string {
  const payload = Buffer.from(value, 'utf8').toString('base64url');
  const mac = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const dot = signed.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = signed.slice(0, dot);
  const mac = Buffer.from(signed.slice(dot + 1));
  const expected = Buffer.from(crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url'));
  if (mac.length !== expected.length || !crypto.timingSafeEqual(mac, expected)) return null;
  return Buffer.from(payload, 'base64url').toString('utf8');
}

const baseCookie = {
  httpOnly: true,
  // Safari refuses Secure cookies on http://localhost, so only require HTTPS in production.
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function getSessionUser(request: NextRequest): SessionUser | null {
  const raw = unsign(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (parsed.email && parsed.role && ROLES.includes(parsed.role)) {
      return { email: parsed.email, name: parsed.name ?? parsed.email, role: parsed.role };
    }
  } catch {
    // malformed/tampered cookie: treat as logged out
  }
  return null;
}

export function setSessionCookie(response: NextResponse, user: SessionUser): void {
  response.cookies.set(SESSION_COOKIE_NAME, sign(JSON.stringify(user)), { ...baseCookie, maxAge: SESSION_MAX_AGE_S });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete({ name: SESSION_COOKIE_NAME, path: '/' });
}

export function setStateCookie(response: NextResponse, state: string): void {
  response.cookies.set(STATE_COOKIE_NAME, sign(state), { ...baseCookie, maxAge: STATE_MAX_AGE_S });
}

export function readStateCookie(request: NextRequest): string | null {
  return unsign(request.cookies.get(STATE_COOKIE_NAME)?.value);
}

export function clearStateCookie(response: NextResponse): void {
  response.cookies.delete({ name: STATE_COOKIE_NAME, path: '/' });
}

type AuthResult = { user: SessionUser; response?: undefined } | { user?: undefined; response: Response };

export function requireAuth(request: NextRequest): AuthResult {
  const user = getSessionUser(request);
  if (!user) return { response: Response.json({ error: '未登入' }, { status: 401 }) };
  return { user };
}

export function requireRole(request: NextRequest, ...roles: Role[]): AuthResult {
  const result = requireAuth(request);
  if (result.response) return result;
  if (!roles.includes(result.user.role)) {
    return { response: Response.json({ error: '權限不足' }, { status: 403 }) };
  }
  return result;
}
