import { jsonError, withRole } from '@/server/api';
import { collections } from '@/server/mongodb';
import { parseObjectId } from '@/server/validate';

// Only action on a report: mark it processed (time and actor come from the server).
export const PUT = withRole<RouteContext<'/api/reports/[id]'>>(['管理者'], async ({ user, context }) => {
  const _id = parseObjectId((await context.params).id);
  if (!_id) return jsonError('找不到這筆回報', 404);
  const c = await collections();
  const result = await c.reports.updateOne({ _id }, { $set: { status: '已處理', processedAt: new Date(), processedBy: user.email } });
  if (!result.matchedCount) return jsonError('找不到這筆回報', 404);
  return Response.json({ ok: true });
});
