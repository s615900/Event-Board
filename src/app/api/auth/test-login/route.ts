import type { NextRequest } from 'next/server';
import { completeLogin, TEST_MODE_ENABLED } from '@/server/login';
import { readJsonBody } from '@/server/api';

export async function POST(request: NextRequest) {
  if (!TEST_MODE_ENABLED) return Response.json({ error: 'Not found' }, { status: 404 });
  const body = await readJsonBody(request);
  const email = String(body['email'] ?? '').trim();
  if (!email) return Response.json({ error: 'email is required' }, { status: 400 });
  return completeLogin(email, email);
}
