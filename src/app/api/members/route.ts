import type { NextRequest } from 'next/server';
import { insertRagicRecord } from '@/server/ragic';
import { handleRagicRead, handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import { memberToRagicFields, type MemberBody } from '@/server/resources';

const config = () => sheetConfig('RAGIC_MEMBERS_URL');

export async function GET() {
  return handleRagicRead(config());
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const body = await readJsonBody<MemberBody>(request);
  const { response, data } = await handleRagicWrite(
    config(),
    (sheetUrl, apiKey) => insertRagicRecord(sheetUrl, apiKey, memberToRagicFields(body)),
    201,
  );
  if (data) {
    await logChange(auth.user.email, '新增', '成員', `新增成員：${body.name ?? ''}`);
  }
  return response;
}
