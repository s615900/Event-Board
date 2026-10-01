import { jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange, type ChangeActionType } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { parseEvent, parseObjectId, parseReviewStatus } from '@/server/validate';

type Ctx = RouteContext<'/api/events/[id]'>;

const REVIEW_ACTION: Record<string, ChangeActionType> = { 已發布: '核准發布', 退回修正: '退回審核', 待審核: '下架' };

export const PUT = withRole<Ctx>(['管理者', '編輯者'], async ({ request, user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這筆賽事', 404);
  const body = await readJsonBody(request);
  const c = await collections();
  const existing = await c.events.findOne({ _id });
  if (!existing) return jsonError('找不到這筆賽事', 404);

  // A body with only reviewStatus is an approve / reject / unpublish action.
  if (Object.keys(body).length === 1 && 'reviewStatus' in body) {
    if (user.role !== '管理者') return jsonError('權限不足', 403);
    const reviewStatus = parseReviewStatus(body);
    if (!reviewStatus) return jsonError('審核狀態不正確', 400);
    await c.events.updateOne({ _id }, { $set: { reviewStatus, updatedAt: new Date() } });
    const action = REVIEW_ACTION[reviewStatus];
    await logChange(user.email, action, '賽事清單', `${action}：${existing.name}`);
    return Response.json({ ok: true });
  }

  const parsed = parseEvent(body);
  if (parsed.error) return jsonError(parsed.error, 400);
  const fields = {
    ...parsed.value,
    // An event can't qualify into itself.
    qualifiesForId: parsed.value.qualifiesForId?.equals(_id) ? null : parsed.value.qualifiesForId,
    // Editors' edits go back to the review queue.
    reviewStatus: user.role === '編輯者' ? '待審核' : parsed.value.reviewStatus,
    updatedAt: new Date(),
  };
  await c.events.updateOne({ _id }, { $set: fields });
  await logChange(user.email, '編輯', '賽事清單', `編輯賽事：${fields.name}`);
  return Response.json({ ok: true });
});

export const DELETE = withRole<Ctx>(['管理者'], async ({ user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這筆賽事', 404);
  const c = await collections();
  const existing = await c.events.findOneAndDelete({ _id });
  if (!existing) return jsonError('找不到這筆賽事', 404);
  // Events that qualified into the deleted one no longer point anywhere.
  await c.events.updateMany({ qualifiesForId: _id }, { $set: { qualifiesForId: null } });
  await logChange(user.email, '刪除', '賽事清單', `刪除賽事：${existing.name}`);
  return Response.json({ ok: true });
});
