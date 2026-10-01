import type { NextRequest } from 'next/server';
import { insertRagicRecord } from '@/server/ragic';
import { handleRagicRead, handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import { sportToRagicFields, type SportBody } from '@/server/resources';

const config = () => sheetConfig('RAGIC_SPORTS_URL');

export async function GET() {
  return handleRagicRead(config());
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, '管理者', '編輯者');
  if (auth.response) return auth.response;
  const body = await readJsonBody<SportBody>(request);
  const { response, data } = await handleRagicWrite(
    config(),
    (sheetUrl, apiKey) => insertRagicRecord(sheetUrl, apiKey, sportToRagicFields(body)),
    201,
  );
  if (data) {
    await logChange(auth.user.email, '新增', '運動項目', `新增運動項目：${body.name ?? ''}`);
  }
  return response;
}
