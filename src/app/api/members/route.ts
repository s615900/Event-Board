import { ObjectId } from 'mongodb';
import { ALL_ROLES, jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { getMembers } from '@/server/queries';
import { parseMember } from '@/server/validate';

// Emails are personal data: signed-in staff only.
export const GET = withRole(ALL_ROLES, async () => Response.json(await getMembers()));

export const POST = withRole(['管理者'], async ({ request, user }) => {
  const parsed = parseMember(await readJsonBody(request));
  if (parsed.error) return jsonError(parsed.error, 400);
  const c = await collections();
  if (await c.members.findOne({ email: parsed.value.email })) return jsonError('這個 Email 已經在成員名冊中', 409);
  const _id = new ObjectId();
  await c.members.insertOne({ _id, ...parsed.value });
  await logChange(user.email, '新增', '成員', `新增成員：${parsed.value.name}`);
  return Response.json({ id: _id.toHexString() }, { status: 201 });
});
