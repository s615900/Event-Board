import type { NextRequest } from 'next/server';
import { deleteRagicRecord, extractRagicField, fetchRagicFieldById, updateRagicRecord } from '@/server/ragic';
import { handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import { MEMBER_FIELD, memberToRagicFields, type MemberBody } from '@/server/resources';

const config = () => sheetConfig('RAGIC_MEMBERS_URL');

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/members/[id]'>) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const body = await readJsonBody<MemberBody>(request);
  const { response, data } = await handleRagicWrite(config(), (sheetUrl, apiKey) =>
    updateRagicRecord(sheetUrl, apiKey, id, memberToRagicFields(body)),
  );
  if (data) {
    const name = extractRagicField(data, MEMBER_FIELD.name) || body.name || '';
    await logChange(auth.user.email, '編輯', '成員', `編輯成員：${name}`);
  }
  return response;
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/members/[id]'>) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const { sheetUrl, apiKey } = config();
  const name = await fetchRagicFieldById(sheetUrl, apiKey, id, '姓名');
  const { response, data } = await handleRagicWrite(config(), (url, key) => deleteRagicRecord(url, key, id));
  if (data) {
    await logChange(auth.user.email, '刪除', '成員', `刪除成員：${name}`);
  }
  return response;
}
