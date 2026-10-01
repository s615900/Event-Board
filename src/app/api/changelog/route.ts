import { ALL_ROLES, withRole } from '@/server/api';
import { getChangelog } from '@/server/queries';

// Entries carry staff emails, so the log is staff-only.
export const GET = withRole(ALL_ROLES, async () => Response.json(await getChangelog()));
