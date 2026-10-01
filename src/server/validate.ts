import 'server-only';
import { ObjectId } from 'mongodb';
import {
  COUNTIES, DIFFICULTIES, GENDERS, MEMBER_STATUSES, REVIEW_STATUSES, ROLES, SCHOOL_LEVELS, SORT_OPTIONS,
  SOURCE_FORMATS, SPORT_GROUPS, TIERS, VIEW_MODES,
} from '@/lib/options';

// Turns untrusted JSON from the browser into clean fields. Every parser returns
// either { value } or { error } (a message shown to the user as-is).

export type Parsed<T> = { value: T; error?: undefined } | { value?: undefined; error: string };

type Body = Record<string, unknown>;

const MAX_TEXT = 2000;

export function parseObjectId(value: unknown): ObjectId | null {
  return typeof value === 'string' && ObjectId.isValid(value) && value.length === 24 ? new ObjectId(value) : null;
}

function text(body: Body, key: string, max = MAX_TEXT): string {
  const v = body[key];
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function oneOf<T extends readonly string[]>(body: Body, key: string, allowed: T, fallback: string): string {
  const v = text(body, key);
  return (allowed as readonly string[]).includes(v) ? v : fallback;
}

function isoDate(body: Body, key: string): string {
  const v = text(body, key, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : '';
}

function webUrl(body: Body, key: string): string {
  const v = text(body, key, 500);
  return /^https?:\/\//i.test(v) ? v : '';
}

export function parseEvent(body: Body) {
  const name = text(body, 'name', 200);
  const startDate = isoDate(body, 'startDate');
  const endDate = isoDate(body, 'endDate') || startDate;
  if (!name) return { error: '請填寫賽事名稱' } as const;
  if (!startDate) return { error: '請填寫正確的開始日期' } as const;
  if (endDate < startDate) return { error: '結束日期不能早於開始日期' } as const;
  const levels = Array.isArray(body['schoolLevels']) ? body['schoolLevels'] : [];
  return {
    value: {
      name,
      sportId: parseObjectId(body['sportId']),
      startDate,
      endDate,
      schoolLevels: SCHOOL_LEVELS.filter((l) => levels.includes(l)),
      ageGroup: text(body, 'ageGroup', 100),
      gender: oneOf(body, 'gender', GENDERS, ''),
      tier: oneOf(body, 'tier', TIERS, ''),
      county: oneOf(body, 'county', COUNTIES, ''),
      location: text(body, 'location', 200),
      note: text(body, 'note'),
      officialUrl: webUrl(body, 'officialUrl'),
      qualifiesForId: parseObjectId(body['qualifiesForId']),
      important: body['important'] === true,
      reviewStatus: oneOf(body, 'reviewStatus', REVIEW_STATUSES, '待審核'),
    },
  } as const;
}

export function parseReviewStatus(body: Body): string | null {
  const v = text(body, 'reviewStatus');
  return (REVIEW_STATUSES as readonly string[]).includes(v) ? v : null;
}

export function parseSport(body: Body) {
  const name = text(body, 'name', 50);
  if (!name) return { error: '請填寫運動項目名稱' } as const;
  const color = text(body, 'color', 7);
  return {
    value: {
      name,
      color: /^#[0-9a-f]{6}$/i.test(color) ? color : '#087F8C',
      group: oneOf(body, 'group', SPORT_GROUPS, '其他'),
      sourceId: parseObjectId(body['sourceId']),
    },
  } as const;
}

export function parseSource(body: Body) {
  const name = text(body, 'name', 100);
  if (!name) return { error: '請填寫來源名稱' } as const;
  return {
    value: {
      name,
      url: webUrl(body, 'url'),
      announceUrl: webUrl(body, 'announceUrl'),
      format: oneOf(body, 'format', SOURCE_FORMATS, 'HTML'),
      difficulty: oneOf(body, 'difficulty', DIFFICULTIES, '中'),
      note: text(body, 'note'),
      lastChecked: isoDate(body, 'lastChecked'),
      lastFound: isoDate(body, 'lastFound'),
    },
  } as const;
}

export function parseMember(body: Body) {
  const name = text(body, 'name', 50);
  const email = text(body, 'email', 200).toLowerCase();
  if (!name) return { error: '請填寫姓名' } as const;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: '請填寫正確的 Email' } as const;
  return {
    value: {
      name,
      email,
      role: oneOf(body, 'role', ROLES, '檢視者'),
      status: oneOf(body, 'status', MEMBER_STATUSES, '啟用'),
    },
  } as const;
}

export function parseSettings(body: Body) {
  return {
    value: {
      showEnded: body['showEnded'] === true,
      allowGuestReport: body['allowGuestReport'] === true,
      pinFeatured: body['pinFeatured'] === true,
      sortBy: oneOf(body, 'sortBy', SORT_OPTIONS, '依日期'),
      viewMode: oneOf(body, 'viewMode', VIEW_MODES, '條列'),
    },
  } as const;
}
