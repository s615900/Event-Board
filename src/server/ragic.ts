import 'server-only';

export type RagicFields = Record<string, string | string[] | undefined>;

function buildRagicBody(fields: RagicFields): URLSearchParams {
  const body = new URLSearchParams();
  for (const [fieldId, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) body.append(fieldId, item);
    } else {
      body.append(fieldId, value);
    }
  }
  return body;
}

function withApiKey(sheetUrl: string, apiKey: string): string {
  const separator = sheetUrl.includes('?') ? '&' : '?';
  return `${sheetUrl}${separator}api&APIKey=${encodeURIComponent(apiKey)}`;
}

export async function fetchRagicSheet(sheetUrl: string, apiKey: string): Promise<Response> {
  return fetch(withApiKey(sheetUrl, apiKey), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
}

export async function insertRagicRecord(sheetUrl: string, apiKey: string, fields: RagicFields): Promise<Response> {
  return fetch(withApiKey(sheetUrl, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: buildRagicBody(fields),
  });
}

export async function updateRagicRecord(
  sheetUrl: string,
  apiKey: string,
  ragicId: string,
  fields: RagicFields,
): Promise<Response> {
  return fetch(withApiKey(`${sheetUrl}/${encodeURIComponent(ragicId)}`, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: buildRagicBody(fields),
  });
}

export async function deleteRagicRecord(sheetUrl: string, apiKey: string, ragicId: string): Promise<Response> {
  return fetch(withApiKey(`${sheetUrl}/${encodeURIComponent(ragicId)}`, apiKey), {
    method: 'DELETE',
  });
}

export async function fetchRagicRecord(sheetUrl: string, apiKey: string, ragicId: string): Promise<Response> {
  return fetch(withApiKey(`${sheetUrl}/${encodeURIComponent(ragicId)}`, apiKey), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
}

// Pulls a single field's current value out of a Ragic write response's echoed
// record (`{ data: { data: { [fieldId]: value } } }`), used to build changelog
// notes without a second round trip after an insert/update.
export function extractRagicField(writeResult: unknown, fieldId: string): string {
  if (writeResult && typeof writeResult === 'object' && 'data' in writeResult) {
    const inner = (writeResult as { data?: unknown }).data;
    if (inner && typeof inner === 'object') {
      const value = (inner as Record<string, unknown>)[fieldId];
      if (typeof value === 'string') return value;
    }
  }
  return '';
}

// Looks up one field's value by record id before a delete, so the changelog
// note can still name what was removed. Never throws — returns "" on any failure.
// Note: unlike a write response (keyed by numeric field id), Ragic's read API
// keys fields by their display name (e.g. "協會名稱"), so `fieldName` must be
// the Chinese label, not the numeric field id used for inserts/updates.
export async function fetchRagicFieldById(
  sheetUrl: string | undefined,
  apiKey: string | undefined,
  ragicId: string,
  fieldName: string,
): Promise<string> {
  if (!sheetUrl || !apiKey) return '';
  try {
    const res = await fetchRagicRecord(sheetUrl, apiKey, ragicId);
    if (!res.ok) return '';
    const json = (await res.json()) as Record<string, unknown>;
    const record = json[ragicId];
    if (record && typeof record === 'object') {
      const value = (record as Record<string, unknown>)[fieldName];
      if (typeof value === 'string') return value;
    }
  } catch {
    // best-effort only; a failed lookup just means the changelog note omits the name
  }
  return '';
}

export function toRagicDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
