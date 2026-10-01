import type { NextRequest } from 'next/server';
import { insertRagicRecord } from '@/server/ragic';
import { handleRagicRead, handleRagicWrite, readJsonBody } from '@/server/ragic-respond';
import { requireAuth } from '@/server/session';
import { CHANGELOG_FIELD, buildChangelogFields, changelogConfig } from '@/server/ragic-changelog';

const RECENT_LIMIT = 100;

interface ChangelogBody {
  actionType?: string;
  table?: string;
  note?: string;
}

// Entries carry staff emails, so the log is admin-only like the page that shows it.
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  return handleRagicRead(changelogConfig(), (json) =>
    Object.fromEntries(
      Object.entries(json)
        .sort(([, a], [, b]) =>
          String(b[CHANGELOG_FIELD.time] ?? '').localeCompare(String(a[CHANGELOG_FIELD.time] ?? '')),
        )
        .slice(0, RECENT_LIMIT),
    ),
  );
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.response) return auth.response;
  const body = await readJsonBody<ChangelogBody>(request);
  const { response } = await handleRagicWrite(
    changelogConfig(),
    (sheetUrl, apiKey) =>
      insertRagicRecord(
        sheetUrl,
        apiKey,
        buildChangelogFields(auth.user.email, body.actionType ?? '', body.table ?? '', body.note ?? ''),
      ),
    201,
  );
  return response;
}
