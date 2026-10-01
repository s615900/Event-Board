import { ObjectId } from 'mongodb';
import { ALL_ROLES, jsonError, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { getAllEvents } from '@/server/queries';
import { parseEvent } from '@/server/validate';

export const GET = withRole(ALL_ROLES, async () => Response.json(await getAllEvents()));

export const POST = withRole(['管理者', '編輯者'], async ({ request, user }) => {
  const parsed = parseEvent(await readJsonBody(request));
  if (parsed.error) return jsonError(parsed.error, 400);
  // Editors' submissions always go to the review queue.
  const reviewStatus = user.role === '編輯者' ? '待審核' : parsed.value.reviewStatus;
  const now = new Date();
  const c = await collections();
  const _id = new ObjectId();
  await c.events.insertOne({ _id, ...parsed.value, reviewStatus, submittedBy: user.name || user.email, createdAt: now, updatedAt: now });
  await logChange(user.email, '新增', '賽事清單', `新增賽事：${parsed.value.name}`);
  return Response.json({ id: _id.toHexString() }, { status: 201 });
});
