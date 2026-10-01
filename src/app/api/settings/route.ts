import { handleRagicRead, sheetConfig } from '@/server/ragic-respond';

// This sheet always holds exactly one record (前台顯示控制); the public
// homepage reads it unauthenticated, same as /events and /sports.
export async function GET() {
  return handleRagicRead(sheetConfig('RAGIC_SETTINGS_URL'));
}
