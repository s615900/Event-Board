import type { NextRequest } from 'next/server';
import { deleteRagicRecord, extractRagicField, fetchRagicFieldById, updateRagicRecord } from '@/server/ragic';
import { handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { logChange } from '@/server/ragic-changelog';
import {
  EVENT_FIELD,
  REVIEW_ACTION_LABEL,
  enforceReviewStatus,
  eventToRagicFields,
  isReviewOnlyUpdate,
  type EventBody,
} from '@/server/resources';

const config = () => sheetConfig('RAGIC_EVENTS_URL');

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/events/[id]'>) {
  const auth = requireRole(request, '管理者', '編輯者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const raw = await readJsonBody<EventBody>(request);
  const reviewOnly = isReviewOnlyUpdate(raw as Record<string, unknown>);
  const body = enforceReviewStatus(raw, auth.user.role);
  const { response, data } = await handleRagicWrite(config(), (sheetUrl, apiKey) =>
    updateRagicRecord(sheetUrl, apiKey, id, eventToRagicFields(body)),
  );
  if (data) {
    const name = extractRagicField(data, EVENT_FIELD.name) || body.name || '';
    const reviewAction = reviewOnly && body.reviewStatus ? REVIEW_ACTION_LABEL[body.reviewStatus] : undefined;
    if (reviewAction) {
      await logChange(auth.user.email, reviewAction, '賽事清單', `${reviewAction}：${name}`);
    } else {
      await logChange(auth.user.email, '編輯', '賽事清單', `編輯賽事：${name}`);
    }
  }
  return response;
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/events/[id]'>) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const { sheetUrl, apiKey } = config();
  const name = await fetchRagicFieldById(sheetUrl, apiKey, id, '賽事名稱');
  const { response, data } = await handleRagicWrite(config(), (url, key) => deleteRagicRecord(url, key, id));
  if (data) {
    await logChange(auth.user.email, '刪除', '賽事清單', `刪除賽事：${name}`);
  }
  return response;
}
