import { ALL_ROLES, readJsonBody, withRole } from '@/server/api';
import { logChange } from '@/server/changelog';
import { collections } from '@/server/mongodb';
import { getSettings } from '@/server/queries';
import { parseSettings } from '@/server/validate';

export const GET = withRole(ALL_ROLES, async () => Response.json(await getSettings()));

export const PUT = withRole(['管理者'], async ({ request, user }) => {
  const { value } = parseSettings(await readJsonBody(request));
  const c = await collections();
  await c.settings.updateOne({ _id: 'site' }, { $set: value }, { upsert: true });
  await logChange(user.email, '編輯', '前台設定', '編輯前台顯示控制');
  return Response.json({ ok: true });
});
