import type { NextRequest } from 'next/server';
import { getSessionUser } from '@/server/session';

export function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) return Response.json({ error: '未登入' }, { status: 401 });
  return Response.json(user);
}
