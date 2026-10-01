import 'server-only';
import type { NextRequest } from 'next/server';
import { logger } from './logger';
import { requireRole, type Role, type SessionUser } from './session';

export const ALL_ROLES: Role[] = ['管理者', '編輯者', '檢視者'];

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

type Handler<C> = (ctx: { request: NextRequest; user: SessionUser; context: C }) => Promise<Response>;

// Wraps a route handler with the role check and a catch-all so a database
// outage returns a readable 500 instead of an HTML error page.
export function withRole<C = unknown>(roles: Role[], handler: Handler<C>) {
  return async (request: NextRequest, context: C): Promise<Response> => {
    const auth = requireRole(request, ...roles);
    if (auth.response) return auth.response;
    try {
      return await handler({ request, user: auth.user, context });
    } catch (err) {
      logger.error({ err }, 'API request failed');
      return jsonError('伺服器發生錯誤，請稍後再試', 500);
    }
  };
}
