import { normalizeDate } from './dates';
import type { ChangeLogEntry, ErrorReport, EventItem, EventStatus, Member, ReportStatus, ReviewStatus, SiteSettings, SortBy, Source, Sport, ViewMode } from './types';

// Browser-side helpers for the /api/* route handlers. Reads come back as raw
// Ragic sheets keyed by record id, with fields keyed by their Chinese label.

export type RagicRecord = Record<string, unknown> & { _ragicId: number };

export async function fetchRagicRecords(path: string): Promise<RagicRecord[] | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, RagicRecord>;
    return Object.values(json);
  } catch {
    return null;
  }
}

export function toSources(records: RagicRecord[]): Source[] {
  return records.map(r => ({
    id: `s${r._ragicId}`,
    name: String(r['協會名稱'] ?? ''),
    url: String(r['官網首頁網址'] ?? ''),
    announceurl: String(r['賽事公告頁面網址'] ?? ''),
    format: String(r['資料格式'] ?? ''),
    difficulty: String(r['查詢難易度'] ?? ''),
    note: String(r['備註'] ?? ''),
    lastChecked: String(r['上次查詢日期'] ?? ''),
    lastFound: String(r['上次查到新資料日期'] ?? ''),
  }));
}

export function toSports(records: RagicRecord[]): Sport[] {
  const palette = ['#E9654D', '#087F8C', '#D2A83E', '#536B7A', '#3E9CA8', '#C54D50', '#487C9A'];
  return records.map((r, i) => ({
    id: `sp${r._ragicId}`,
    name: String(r['項目名稱'] ?? ''),
    color: String(r['顏色代碼'] ?? palette[i % palette.length]),
    group: String(r['分類'] ?? ''),
    sourceName: String(r['對應資料來源'] ?? ''),
  }));
}

export function toEvents(records: RagicRecord[], sports: Sport[]): EventItem[] {
  return records.map(r => {
    const sportName = String(r['運動項目'] ?? '');
    const sport = sports.find(s => s.name === sportName);
    const groupsRaw = r['組別'];
    const groups = Array.isArray(groupsRaw) ? groupsRaw.map(String) : groupsRaw ? [String(groupsRaw)] : [];
    // Ragic dates look like 2026/11/04; the app (and <input type="date">) uses 2026-11-04.
    const startdate = normalizeDate(String(r['開始日期'] ?? ''));
    return {
      id: `e${r._ragicId}`,
      name: String(r['賽事名稱'] ?? ''),
      sportName,
      startdate,
      enddate: normalizeDate(String(r['結束日期'] ?? '')) || startdate,
      status: (String(r['狀態'] ?? '') || '報名中') as EventStatus,
      level: groups.join('、'),
      location: String(r['地點'] ?? ''),
      note: String(r['備註'] ?? ''),
      source: sport?.sourceName ?? '',
      important: r['重點賽事'] === '是',
      reviewStatus: (String(r['審核狀態'] ?? '') || '待審核') as ReviewStatus,
      submitterName: String(r['提交者'] ?? ''),
      createdAt: String(r['建立時間'] ?? ''),
    };
  });
}

export function toMembers(records: RagicRecord[]): Member[] {
  return records.map(r => ({
    id: `m${r._ragicId}`,
    name: String(r['姓名'] ?? ''),
    email: String(r['Email'] ?? ''),
    role: String(r['角色'] ?? ''),
    status: String(r['狀態'] ?? ''),
  }));
}

export function toChangeLog(records: RagicRecord[]): ChangeLogEntry[] {
  return records.map(r => ({
    id: `c${r._ragicId}`,
    time: String(r['時間'] ?? ''),
    actor: String(r['操作者'] ?? ''),
    actionType: String(r['動作類型'] ?? ''),
    table: String(r['影響資料表'] ?? ''),
    note: String(r['說明'] ?? ''),
  })).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 100);
}

export function toReports(records: RagicRecord[]): ErrorReport[] {
  return records.map(r => ({
    id: `r${r._ragicId}`,
    time: String(r['時間'] ?? ''),
    eventId: String(r['賽事ID'] ?? ''),
    eventName: String(r['賽事名稱'] ?? ''),
    content: String(r['回報內容'] ?? ''),
    status: (String(r['處理狀態'] ?? '') || '未處理') as ReportStatus,
    processedAt: String(r['處理時間'] ?? ''),
    processedBy: String(r['處理人'] ?? ''),
  })).sort((a, b) => b.time.localeCompare(a.time));
}

export function toSettings(records: RagicRecord[], fallback: SiteSettings): SiteSettings {
  const r = records[0];
  if (!r) return fallback;
  return {
    id: `st${r._ragicId}`,
    name: String(r['設定名稱'] ?? fallback.name),
    showEnded: r['顯示已結束賽事'] === '是',
    allowGuestReport: r['開放訪客回報錯誤'] === '是',
    pinFeatured: r['重點賽事置頂'] === '是',
    sortBy: (String(r['預設排序方式'] ?? '') || fallback.sortBy) as SortBy,
    viewMode: (String(r['預設檢視模式'] ?? '') || fallback.viewMode) as ViewMode,
  };
}

export async function ragicCreate(path: string, body: unknown): Promise<{ ok: boolean; ragicId?: number }> {
  try {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { ragicId?: number };
    return { ok: true, ragicId: data.ragicId };
  } catch {
    return { ok: false };
  }
}

export async function ragicUpdate(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ragicDelete(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}
