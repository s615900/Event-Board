import 'server-only';
import { MongoClient, type Collection, type Db, type ObjectId } from 'mongodb';

// ── Document shapes (one collection each, in the sports_board database) ──────

export interface EventDoc {
  _id: ObjectId;
  name: string;
  sportId: ObjectId | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  schoolLevels: string[]; // 學制：國小 / 國中 / 高中
  ageGroup: string; // 年齡組／年級，自由文字
  gender: string; // 男 / 女 / 混合 / ''
  tier: string; // 賽事層級
  county: string; // 縣市
  location: string;
  note: string;
  officialUrl: string; // 官方公告連結
  qualifiesForId: ObjectId | null; // 晉級至哪一場賽事
  important: boolean;
  reviewStatus: string; // 已發布 / 待審核 / 退回修正
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SportDoc {
  _id: ObjectId;
  name: string;
  color: string;
  group: string;
  sourceId: ObjectId | null;
}

export interface SourceDoc {
  _id: ObjectId;
  name: string;
  url: string;
  announceUrl: string;
  format: string;
  difficulty: string;
  note: string;
  lastChecked: string; // YYYY-MM-DD
  lastFound: string; // YYYY-MM-DD
}

export interface MemberDoc {
  _id: ObjectId;
  name: string;
  email: string; // stored lower-case
  role: string;
  status: string;
}

export interface ChangelogDoc {
  _id: ObjectId;
  time: Date;
  actor: string;
  actionType: string;
  table: string;
  note: string;
}

export interface ReportDoc {
  _id: ObjectId;
  time: Date;
  eventId: string;
  eventName: string;
  content: string;
  status: string; // 未處理 / 已處理
  processedAt: Date | null;
  processedBy: string;
}

export interface SettingsDoc {
  _id: 'site';
  showEnded: boolean;
  allowGuestReport: boolean;
  pinFeatured: boolean;
  sortBy: string;
  viewMode: string;
}

// ── Connection ──────────────────────────────────────────────────────────────

// Reuse one client across hot reloads (dev) and warm serverless invocations.
const globalForMongo = globalThis as unknown as { _sportsBoardMongo?: Promise<MongoClient> };

function databaseName(): string {
  const name = process.env['MONGODB_DB'];
  if (!name) throw new Error('MONGODB_DB environment variable is required but was not provided.');
  return name;
}

// Connects lazily on first use, never at import time, so `next build` works
// without database access.
export async function getDb(): Promise<Db> {
  if (!globalForMongo._sportsBoardMongo) {
    const uri = process.env['MONGODB_URI'];
    if (!uri) throw new Error('MONGODB_URI environment variable is required but was not provided.');
    globalForMongo._sportsBoardMongo = new MongoClient(uri).connect().catch((err) => {
      globalForMongo._sportsBoardMongo = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return (await globalForMongo._sportsBoardMongo).db(databaseName());
}

export async function collections(): Promise<{
  events: Collection<EventDoc>;
  sports: Collection<SportDoc>;
  sources: Collection<SourceDoc>;
  members: Collection<MemberDoc>;
  changelog: Collection<ChangelogDoc>;
  reports: Collection<ReportDoc>;
  settings: Collection<SettingsDoc>;
}> {
  const db = await getDb();
  return {
    events: db.collection<EventDoc>('events'),
    sports: db.collection<SportDoc>('sports'),
    sources: db.collection<SourceDoc>('sources'),
    members: db.collection<MemberDoc>('members'),
    changelog: db.collection<ChangelogDoc>('changelog'),
    reports: db.collection<ReportDoc>('reports'),
    settings: db.collection<SettingsDoc>('settings'),
  };
}

export const DEFAULT_SETTINGS: Omit<SettingsDoc, '_id'> = {
  showEnded: false,
  allowGuestReport: false,
  pinFeatured: true,
  sortBy: '依日期',
  viewMode: '條列',
};
