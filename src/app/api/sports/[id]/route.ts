import { jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { parseObjectId, parseSport } from '@/server/validate';

type Ctx = RouteContext<'/api/sports/[id]'>;

export const PUT = withRole<Ctx>(['管理者', '編輯者'], async ({ request, user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這個運動項目', 404);
  const parsed = parseSport(await readJsonBody(request));
  if (parsed.error) return jsonError(parsed.error, 400);
  const c = await collections();
  if (await c.sports.findOne({ name: parsed.value.name, _id: { $ne: _id } })) return jsonError('已經有同名的運動項目', 409);
  const result = await c.sports.updateOne({ _id }, { $set: parsed.value });
  if (!result.matchedCount) return jsonError('找不到這個運動項目', 404);
  await logChange(user.email, '編輯', '運動項目', `編輯運動項目：${parsed.value.name}`);
  return Response.json({ ok: true });
});

export const DELETE = withRole<Ctx>(['管理者'], async ({ user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這個運動項目', 404);
  const c = await collections();
  const used = await c.events.countDocuments({ sportId: _id });
  if (used) return jsonError(`還有 ${used} 場賽事使用這個運動項目，請先修改那些賽事`, 409);
  const existing = await c.sports.findOneAndDelete({ _id });
  if (!existing) return jsonError('找不到這個運動項目', 404);
  await logChange(user.email, '刪除', '運動項目', `刪除運動項目：${existing.name}`);
  return Response.json({ ok: true });
});
