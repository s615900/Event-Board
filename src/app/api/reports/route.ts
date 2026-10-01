import { handleRagicRead, sheetConfig } from '@/server/ragic-respond';

export async function GET() {
  return handleRagicRead(sheetConfig('RAGIC_REPORTS_URL'));
}
