import { ALL_ROLES, withRole } from '@/server/api';
import { getReports } from '@/server/queries';

export const GET = withRole(ALL_ROLES, async () => Response.json(await getReports()));
