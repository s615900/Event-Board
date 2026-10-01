import { TEST_MODE_ENABLED } from '@/server/login';

export function GET() {
  return Response.json({ testModeEnabled: TEST_MODE_ENABLED });
}
