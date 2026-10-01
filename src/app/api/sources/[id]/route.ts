import type { NextRequest } from 'next/server';
import { deleteRagicRecord, extractRagicField, fetchRagicFieldById, updateRagicRecord } from '@/server/ragic';
import { handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import { SOURCE_FIELD, sourceToRagicFields, type SourceBody } from '@/server/resources';

const config = () => sheetConfig('RAGIC_SOURCES_URL');

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/sources/[id]'>) {
  const auth = requireRole(request, '管理者', '編輯者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const body = await readJsonBody<SourceBody>(request);
  const { response, data } = await handleRagicWrite(config(), (sheetUrl, apiKey) =>
    updateRagicRecord(sheetUrl, apiKey, id, sourceToRagicFields(body)),
  );
  if (data) {
    const name = extractRagicField(data, SOURCE_FIELD.name) || body.name || '';
    await logChange(auth.user.email, '編輯', '資料來源', `編輯資料來源：${name}`);
  }
  return response;
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/sources/[id]'>) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const { sheetUrl, apiKey } = config();
  const name = await fetchRagicFieldById(sheetUrl, apiKey, id, '協會名稱');
  const { response, data } = await handleRagicWrite(config(), (url, key) => deleteRagicRecord(url, key, id));
  if (data) {
    await logChange(auth.user.email, '刪除', '資料來源', `刪除資料來源：${name}`);
  }
  return response;
}
