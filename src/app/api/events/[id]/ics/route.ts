import type { NextRequest } from 'next/server';
import { icsFile } from '@/lib/calendar';
import { getPublicEvent } from '@/server/queries';

// Public: downloads a published event as an .ics file for phone / Outlook calendars.
export async function GET(request: NextRequest, ctx: RouteContext<'/api/events/[id]/ics'>) {
  const { id } = await ctx.params;
  const detail = await getPublicEvent(id);
  if (!detail) return Response.json({ error: '找不到這筆賽事' }, { status: 404 });
  const pageUrl = new URL(`/events/${id}`, request.url).toString();
  return new Response(icsFile(detail.event, pageUrl), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="event-${id}.ics"; filename*=UTF-8''${encodeURIComponent(detail.event.name)}.ics`,
    },
  });
}
