import type { NextRequest } from 'next/server';
import { insertRagicRecord } from '@/server/ragic';
import { handleRagicRead, handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import { sourceToRagicFields, type SourceBody } from '@/server/resources';

const config = () => sheetConfig('RAGIC_SOURCES_URL');

export async function GET() {
  return handleRagicRead(config());
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, '管理者', '編輯者');
  if (auth.response) return auth.response;
  const body = await readJsonBody<SourceBody>(request);
  const { response, data } = await handleRagicWrite(
    config(),
    (sheetUrl, apiKey) => insertRagicRecord(sheetUrl, apiKey, sourceToRagicFields(body)),
    201,
  );
  if (data) {
    await logChange(auth.user.email, '新增', '資料來源', `新增資料來源：${body.name ?? ''}`);
  }
  return response;
}
