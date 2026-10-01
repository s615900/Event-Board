import 'server-only';
import type { ChangelogDoc, EventDoc, MemberDoc, ReportDoc, SettingsDoc, SourceDoc, SportDoc } from './mongodb';
import type { ChangeLogEntry, ErrorReport, EventItem, Member, ReportStatus, ReviewStatus, SiteSettings, SortBy, Source, Sport, ViewMode } from '@/lib/types';
import { DEFAULT_SETTINGS } from './mongodb';

// MongoDB documents → plain JSON-safe objects for the browser.

export function toSource(doc: SourceDoc): Source {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    url: doc.url,
    announceUrl: doc.announceUrl,
    format: doc.format,
    difficulty: doc.difficulty,
    note: doc.note,
    lastChecked: doc.lastChecked,
    lastFound: doc.lastFound,
  };
}

export function toSport(doc: SportDoc, sources: SourceDoc[]): Sport {
  const source = doc.sourceId ? sources.find((s) => s._id.equals(doc.sourceId!)) : undefined;
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    color: doc.color,
    group: doc.group,
    sourceId: doc.sourceId?.toHexString() ?? '',
    sourceName: source?.name ?? '',
  };
}

export function toEvent(doc: EventDoc, sports: Sport[]): EventItem {
  const sportId = doc.sportId?.toHexString() ?? '';
  const sport = sports.find((s) => s.id === sportId);
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    sportId,
    sportName: sport?.name ?? '',
    sportColor: sport?.color ?? '#087f8c',
    startDate: doc.startDate,
    endDate: doc.endDate || doc.startDate,
    schoolLevels: doc.schoolLevels ?? [],
    ageGroup: doc.ageGroup ?? '',
    gender: doc.gender ?? '',
    tier: doc.tier ?? '',
    county: doc.county ?? '',
    location: doc.location ?? '',
    note: doc.note ?? '',
    officialUrl: doc.officialUrl ?? '',
    qualifiesForId: doc.qualifiesForId?.toHexString() ?? '',
    important: Boolean(doc.important),
    reviewStatus: doc.reviewStatus as ReviewStatus,
    submittedBy: doc.submittedBy ?? '',
    createdAt: doc.createdAt?.toISOString() ?? '',
  };
}

export function toMember(doc: MemberDoc): Member {
  return { id: doc._id.toHexString(), name: doc.name, email: doc.email, role: doc.role, status: doc.status };
}

// Shown in Taiwan time, e.g. "2026/10/01 18:05".
function formatTaipeiTime(d: Date | null | undefined): string {
  if (!d) return '';
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d);
}

export function toChangelog(doc: ChangelogDoc): ChangeLogEntry {
  return { id: doc._id.toHexString(), time: formatTaipeiTime(doc.time), actor: doc.actor, actionType: doc.actionType, table: doc.table, note: doc.note };
}

export function toReport(doc: ReportDoc): ErrorReport {
  return {
    id: doc._id.toHexString(),
    time: formatTaipeiTime(doc.time),
    eventId: doc.eventId,
    eventName: doc.eventName,
    content: doc.content,
    status: doc.status as ReportStatus,
    processedAt: formatTaipeiTime(doc.processedAt),
    processedBy: doc.processedBy,
  };
}

export function toSettings(doc: SettingsDoc | null): SiteSettings {
  const s = { ...DEFAULT_SETTINGS, ...doc };
  return {
    showEnded: s.showEnded,
    allowGuestReport: s.allowGuestReport,
    pinFeatured: s.pinFeatured,
    sortBy: s.sortBy as SortBy,
    viewMode: s.viewMode as ViewMode,
  };
}
