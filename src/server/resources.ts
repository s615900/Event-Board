import 'server-only';
import type { ChangeActionType } from './ragic-changelog';

// Ragic's write API matches fields by numeric field ID, not display label.

// ── 賽事清單 ──────────────────────────────────────────────
export const EVENT_FIELD = {
  name: '1001347', // 賽事名稱
  sportLink: '1001348', // 運動項目（連結欄位，值為運動項目的項目名稱）
  startDate: '1001349', // 開始日期
  endDate: '1001350', // 結束日期
  status: '1001351', // 狀態
  groups: '1001352', // 組別（多選欄位）
  location: '1001353', // 地點
  note: '1001354', // 備註
  important: '1001356', // 重點賽事
  reviewStatus: '1001357', // 審核狀態
};

export interface EventBody {
  name?: string;
  sportName?: string;
  startdate?: string;
  enddate?: string;
  status?: string;
  level?: string;
  location?: string;
  note?: string;
  important?: boolean;
  reviewStatus?: string;
}

function toRagicDate(value: string | undefined): string | undefined {
  return value === undefined ? undefined : value.replaceAll('-', '/');
}

function toRagicGroups(level: string | undefined): string[] | undefined {
  if (level === undefined) return undefined;
  return level.split('、').map((s) => s.trim()).filter(Boolean);
}

export function eventToRagicFields(body: EventBody) {
  return {
    [EVENT_FIELD.name]: body.name,
    [EVENT_FIELD.sportLink]: body.sportName,
    [EVENT_FIELD.startDate]: toRagicDate(body.startdate),
    [EVENT_FIELD.endDate]: toRagicDate(body.enddate),
    [EVENT_FIELD.status]: body.status,
    [EVENT_FIELD.groups]: toRagicGroups(body.level),
    [EVENT_FIELD.location]: body.location,
    [EVENT_FIELD.note]: body.note,
    [EVENT_FIELD.important]: body.important === undefined ? undefined : body.important ? '是' : '否',
    [EVENT_FIELD.reviewStatus]: body.reviewStatus,
  };
}

// Editors can save events, but their submissions always land back in the
// review queue rather than going straight to publish.
export function enforceReviewStatus(body: EventBody, role: string): EventBody {
  if (role === '編輯者') {
    return { ...body, reviewStatus: '待審核' };
  }
  return body;
}

// Maps the reviewStatus value a review-only PUT (see isReviewOnlyUpdate) sets
// to the changelog action type it represents.
export const REVIEW_ACTION_LABEL: Partial<Record<string, ChangeActionType>> = {
  已發布: '核准發布',
  退回修正: '退回審核',
  待審核: '下架',
};

// The admin events page and the review-flow page both update only reviewStatus
// when approving/rejecting/unpublishing, never alongside other fields — so a
// single-key body is how we tell a review action apart from a full edit.
export function isReviewOnlyUpdate(body: Record<string, unknown>): boolean {
  const keys = Object.keys(body ?? {});
  return keys.length === 1 && keys[0] === 'reviewStatus';
}

// ── 運動項目 ──────────────────────────────────────────────
export const SPORT_FIELD = {
  name: '1001342', // 項目名稱
  color: '1001343', // 顏色代碼
  group: '1001344', // 分類
  sourceLink: '1001346', // 對應資料來源（連結欄位，值為資料來源的協會名稱）
};

export interface SportBody {
  name?: string;
  color?: string;
  group?: string;
  sourceName?: string;
}

export function sportToRagicFields(body: SportBody) {
  return {
    [SPORT_FIELD.name]: body.name,
    [SPORT_FIELD.color]: body.color,
    [SPORT_FIELD.group]: body.group,
    [SPORT_FIELD.sourceLink]: body.sourceName,
  };
}

// ── 資料來源 ──────────────────────────────────────────────
export const SOURCE_FIELD = {
  name: '1001333', // 協會名稱
  url: '1001334', // 官網首頁網址
  announceurl: '1001335', // 賽事公告頁面網址
  format: '1001336', // 資料格式
  difficulty: '1001337', // 查詢難易度
  note: '1001338', // 備註
};

export interface SourceBody {
  name?: string;
  url?: string;
  announceurl?: string;
  format?: string;
  difficulty?: string;
  note?: string;
}

export function sourceToRagicFields(body: SourceBody) {
  return {
    [SOURCE_FIELD.name]: body.name,
    [SOURCE_FIELD.url]: body.url,
    [SOURCE_FIELD.announceurl]: body.announceurl,
    [SOURCE_FIELD.format]: body.format,
    [SOURCE_FIELD.difficulty]: body.difficulty,
    [SOURCE_FIELD.note]: body.note,
  };
}

// ── 成員 ─────────────────────────────────────────────────
export const MEMBER_FIELD = {
  name: '1001361', // 姓名
  email: '1001362', // Email
  role: '1001363', // 角色
  status: '1001364', // 狀態
};

export interface MemberBody {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export function memberToRagicFields(body: MemberBody) {
  return {
    [MEMBER_FIELD.name]: body.name,
    [MEMBER_FIELD.email]: body.email,
    [MEMBER_FIELD.role]: body.role,
    [MEMBER_FIELD.status]: body.status,
  };
}

// ── 前台設定 ──────────────────────────────────────────────
export const SETTINGS_FIELD = {
  showEnded: '1001372', // 顯示已結束賽事
  allowGuestReport: '1001373', // 開放訪客回報錯誤
  pinFeatured: '1001374', // 重點賽事置頂
  sortBy: '1001375', // 預設排序方式
  viewMode: '1001376', // 預設檢視模式
  name: '1001377', // 設定名稱
};

export interface SettingsBody {
  showEnded?: boolean;
  allowGuestReport?: boolean;
  pinFeatured?: boolean;
  sortBy?: string;
  viewMode?: string;
  name?: string;
}

const yesNo = (v: boolean | undefined) => (v === undefined ? undefined : v ? '是' : '否');

export function settingsToRagicFields(body: SettingsBody) {
  return {
    [SETTINGS_FIELD.showEnded]: yesNo(body.showEnded),
    [SETTINGS_FIELD.allowGuestReport]: yesNo(body.allowGuestReport),
    [SETTINGS_FIELD.pinFeatured]: yesNo(body.pinFeatured),
    [SETTINGS_FIELD.sortBy]: body.sortBy,
    [SETTINGS_FIELD.viewMode]: body.viewMode,
    [SETTINGS_FIELD.name]: body.name,
  };
}

// ── 錯誤回報 ──────────────────────────────────────────────
export const REPORT_FIELD = {
  time: '1001379', // 時間
  eventId: '1001380', // 賽事ID
  eventName: '1001381', // 賽事名稱
  content: '1001382', // 回報內容
  status: '1001383', // 處理狀態
  processedAt: '1001384', // 處理時間
  processedBy: '1001385', // 處理人
};

export interface ReportBody {
  eventName?: string;
  reason?: string;
}
