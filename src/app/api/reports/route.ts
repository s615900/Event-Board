import type { NextRequest } from 'next/server';
import { handleRagicRead, sheetConfig } from '@/server/ragic-respond';
import { requireAuth } from '@/server/session';

// Guest reports are internal triage data, only shown on the admin reports page.
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  return handleRagicRead(sheetConfig('RAGIC_REPORTS_URL'));
}
