import type { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { jsonError, readJsonBody } from '@/server/api';
import { logger } from '@/server/logger';
import { collections } from '@/server/mongodb';
import { toSettings } from '@/server/serialize';
import { parseObjectId } from '@/server/validate';

// Guest-facing "回報錯誤" button on the public site (no login).
export async function POST(request: NextRequest, ctx: RouteContext<'/api/events/[id]/report'>) {
  const _id = parseObjectId((await ctx.params).id);
  if (!_id) return jsonError('找不到這筆賽事', 404);
  const body = await readJsonBody(request);
  const reason = typeof body['reason'] === 'string' ? body['reason'].trim().slice(0, 1000) : '';
  try {
    const c = await collections();
    const [event, settings] = await Promise.all([
      c.events.findOne({ _id, reviewStatus: '已發布' }),
      c.settings.findOne({ _id: 'site' }),
    ]);
    if (!event) return jsonError('找不到這筆賽事', 404);
    if (!toSettings(settings).allowGuestReport) return jsonError('目前未開放回報', 403);
    await c.reports.insertOne({
      _id: new ObjectId(),
      time: new Date(),
      eventId: _id.toHexString(),
      eventName: event.name,
      content: reason || '無說明',
      status: '未處理',
      processedAt: null,
      processedBy: '',
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    logger.error({ err }, 'Failed to save report');
    return jsonError('伺服器發生錯誤，請稍後再試', 500);
  }
}
