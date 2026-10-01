import 'server-only';
import { NextResponse } from 'next/server';
import { logger } from './logger';
import { findMemberByEmail } from './ragic-members';
import { ROLES, setSessionCookie, type Role, type SessionUser } from './session';

// Looks the email up in the Ragic member roster and, if it belongs to an active
// member, issues the session cookie. `redirectBase` set → browser redirect flow
// (Google callback); unset → JSON response (test-mode login).
export async function completeLogin(
  email: string,
  fallbackName: string,
  redirectBase?: string,
): Promise<NextResponse> {
  const fail = (code: string, status: number, message: string) =>
    redirectBase
      ? NextResponse.redirect(new URL(`/admin/login?error=${code}`, redirectBase))
      : NextResponse.json({ error: message }, { status });

  let member;
  try {
    member = await findMemberByEmail(email);
  } catch (err) {
    logger.error({ err }, 'Failed to look up member in Ragic');
    return fail('lookup_failed', 502, '無法連線至成員名冊，請稍後再試');
  }

  const role = member?.role as Role | undefined;
  if (!member || member.status === '停用' || !role || !ROLES.includes(role)) {
    logger.info({ email }, 'Login rejected: no matching active member record');
    return fail('not_member', 403, '你的帳號尚未被加入成員名冊，請聯繫管理者');
  }

  const user: SessionUser = { email: member.email, name: member.name || fallbackName, role };
  const response = redirectBase
    ? NextResponse.redirect(new URL('/admin', redirectBase))
    : NextResponse.json({ ok: true, ...user });
  setSessionCookie(response, user);
  return response;
}

// TEST-MODE ONLY: lets QA log in with an arbitrary email instead of a real Google
// account. Only ever active when AUTH_TEST_MODE=1 is set — never in production.
export const TEST_MODE_ENABLED = process.env['AUTH_TEST_MODE'] === '1';
