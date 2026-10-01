import type { NextRequest } from 'next/server';
import { toRagicDateTime, updateRagicRecord } from '@/server/ragic';
import { handleRagicWrite, sheetConfig } from '@/server/ragic-respond';
import { requireRole } from '@/server/session';
import { REPORT_FIELD } from '@/server/resources';

// Only action available on a report: mark it processed. Status/time/actor are
// always server-derived, never taken from the request body.
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/reports/[id]'>) {
  const auth = requireRole(request, '管理者');
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const { response } = await handleRagicWrite(sheetConfig('RAGIC_REPORTS_URL'), (sheetUrl, apiKey) =>
    updateRagicRecord(sheetUrl, apiKey, id, {
      [REPORT_FIELD.status]: '已處理',
      [REPORT_FIELD.processedAt]: toRagicDateTime(new Date()),
      [REPORT_FIELD.processedBy]: auth.user.email,
    }),
  );
  return response;
}
