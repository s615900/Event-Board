import { jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { parseMember, parseObjectId } from '@/server/validate';

type Ctx = RouteContext<'/api/members/[id]'>;

export const PUT = withRole<Ctx>(['管理者'], async ({ request, user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這位成員', 404);
  const parsed = parseMember(await readJsonBody(request));
  if (parsed.error) return jsonError(parsed.error, 400);
  const c = await collections();
  const existing = await c.members.findOne({ _id });
  if (!existing) return jsonError('找不到這位成員', 404);
  if (await c.members.findOne({ email: parsed.value.email, _id: { $ne: _id } })) return jsonError('這個 Email 已經在成員名冊中', 409);
  // Stop admins from locking themselves out of the admin.
  if (existing.email === user.email.toLowerCase() && (parsed.value.role !== '管理者' || parsed.value.status !== '啟用')) {
    return jsonError('不能變更自己的管理者身份或停用自己', 400);
  }
  await c.members.updateOne({ _id }, { $set: parsed.value });
  await logChange(user.email, '編輯', '成員', `編輯成員：${parsed.value.name}`);
  return Response.json({ ok: true });
});

export const DELETE = withRole<Ctx>(['管理者'], async ({ user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這位成員', 404);
  const c = await collections();
  const existing = await c.members.findOne({ _id });
  if (!existing) return jsonError('找不到這位成員', 404);
  if (existing.email === user.email.toLowerCase()) return jsonError('不能移除自己', 400);
  await c.members.deleteOne({ _id });
  await logChange(user.email, '刪除', '成員', `刪除成員：${existing.name}`);
  return Response.json({ ok: true });
});
