import type { NextRequest } from 'next/server';
import { extractRagicField, updateRagicRecord } from '@/server/ragic';
import { handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import { SETTINGS_FIELD, settingsToRagicFields, type SettingsBody } from '@/server/resources';

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/settings/[id]'>) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const body = await readJsonBody<SettingsBody>(request);
  const { response, data } = await handleRagicWrite(sheetConfig('RAGIC_SETTINGS_URL'), (sheetUrl, apiKey) =>
    updateRagicRecord(sheetUrl, apiKey, id, settingsToRagicFields(body)),
  );
  if (data) {
    const name = extractRagicField(data, SETTINGS_FIELD.name) || body.name || '';
    await logChange(auth.user.email, '編輯', '前台設定', `編輯前台顯示控制：${name}`);
  }
  return response;
}
