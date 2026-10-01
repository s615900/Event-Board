import type { NextRequest } from 'next/server';
import { insertRagicRecord, toRagicDateTime } from '@/server/ragic';
import { handleRagicWrite, readJsonBody, sheetConfig } from '@/server/ragic-respond';
import { REPORT_FIELD, type ReportBody } from '@/server/resources';

// Guest-facing "回報錯誤" button on the public homepage. No description input
// exists on the frontend today, so `reason` is currently always empty and
// falls back to "無說明".
export async function POST(request: NextRequest, ctx: RouteContext<'/api/events/[id]/report'>) {
  const { id } = await ctx.params;
  const body = await readJsonBody<ReportBody>(request);
  const { response } = await handleRagicWrite(
    sheetConfig('RAGIC_REPORTS_URL'),
    (sheetUrl, apiKey) =>
      insertRagicRecord(sheetUrl, apiKey, {
        [REPORT_FIELD.time]: toRagicDateTime(new Date()),
        [REPORT_FIELD.eventId]: id,
        [REPORT_FIELD.eventName]: body.eventName ?? '',
        [REPORT_FIELD.content]: body.reason?.trim() || '無說明',
        [REPORT_FIELD.status]: '未處理',
      }),
    201,
  );
  return response;
}
