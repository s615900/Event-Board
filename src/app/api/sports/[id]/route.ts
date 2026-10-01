import type { NextRequest } from 'next/server';
import { deleteRagicRecord, extractRagicField, fetchRagicFieldById, updateRagicRecord } from '@/server/ragic';
import { handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import { SPORT_FIELD, sportToRagicFields, type SportBody } from '@/server/resources';

const config = () => sheetConfig('RAGIC_SPORTS_URL');

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/sports/[id]'>) {
  const auth = requireRole(request, '管理者', '編輯者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const body = await readJsonBody<SportBody>(request);
  const { response, data } = await handleRagicWrite(config(), (sheetUrl, apiKey) =>
    updateRagicRecord(sheetUrl, apiKey, id, sportToRagicFields(body)),
  );
  if (data) {
    const name = extractRagicField(data, SPORT_FIELD.name) || body.name || '';
    await logChange(auth.user.email, '編輯', '運動項目', `編輯運動項目：${name}`);
  }
  return response;
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/sports/[id]'>) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const { sheetUrl, apiKey } = config();
  const name = await fetchRagicFieldById(sheetUrl, apiKey, id, '項目名稱');
  const { response, data } = await handleRagicWrite(config(), (url, key) => deleteRagicRecord(url, key, id));
  if (data) {
    await logChange(auth.user.email, '刪除', '運動項目', `刪除運動項目：${name}`);
  }
  return response;
}
