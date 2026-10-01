import { ObjectId } from 'mongodb';
import { ALL_ROLES, jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { getSportsAndSources } from '@/server/queries';
import { parseSport } from '@/server/validate';

export const GET = withRole(ALL_ROLES, async () => Response.json((await getSportsAndSources()).sports));

export const POST = withRole(['管理者', '編輯者'], async ({ request, user }) => {
  const parsed = parseSport(await readJsonBody(request));
  if (parsed.error) return jsonError(parsed.error, 400);
  const c = await collections();
  if (await c.sports.findOne({ name: parsed.value.name })) return jsonError('已經有同名的運動項目', 409);
  const _id = new ObjectId();
  await c.sports.insertOne({ _id, ...parsed.value });
  await logChange(user.email, '新增', '運動項目', `新增運動項目：${parsed.value.name}`);
  return Response.json({ id: _id.toHexString() }, { status: 201 });
});
