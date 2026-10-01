import { ObjectId } from 'mongodb';
import { ALL_ROLES, jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { getSportsAndSources } from '@/server/queries';
import { parseSource } from '@/server/validate';

export const GET = withRole(ALL_ROLES, async () => Response.json((await getSportsAndSources()).sources));

export const POST = withRole(['管理者', '編輯者'], async ({ request, user }) => {
  const parsed = parseSource(await readJsonBody(request));
  if (parsed.error) return jsonError(parsed.error, 400);
  const c = await collections();
  const _id = new ObjectId();
  await c.sources.insertOne({ _id, ...parsed.value });
  await logChange(user.email, '新增', '資料來源', `新增資料來源：${parsed.value.name}`);
  return Response.json({ id: _id.toHexString() }, { status: 201 });
});
