import { jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { parseObjectId, parseSource } from '@/server/validate';

type Ctx = RouteContext<'/api/sources/[id]'>;

export const PUT = withRole<Ctx>(['管理者', '編輯者'], async ({ request, user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這個資料來源', 404);
  const parsed = parseSource(await readJsonBody(request));
  if (parsed.error) return jsonError(parsed.error, 400);
  const c = await collections();
  const result = await c.sources.updateOne({ _id }, { $set: parsed.value });
  if (!result.matchedCount) return jsonError('找不到這個資料來源', 404);
  await logChange(user.email, '編輯', '資料來源', `編輯資料來源：${parsed.value.name}`);
  return Response.json({ ok: true });
});

export const DELETE = withRole<Ctx>(['管理者'], async ({ user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這個資料來源', 404);
  const c = await collections();
  const existing = await c.sources.findOneAndDelete({ _id });
  if (!existing) return jsonError('找不到這個資料來源', 404);
  await c.sports.updateMany({ sourceId: _id }, { $set: { sourceId: null } });
  await logChange(user.email, '刪除', '資料來源', `刪除資料來源：${existing.name}`);
  return Response.json({ ok: true });
});
