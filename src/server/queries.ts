import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import { collections } from './mongodb';
import { toChangelog, toEvent, toMember, toReport, toSettings, toSource, toSport } from './serialize';
import { parseObjectId } from './validate';
import type { EventItem, SiteSettings, Source, Sport } from '@/lib/types';

const CHANGELOG_LIMIT = 100;

async function loadTaxonomy(): Promise<{ sports: Sport[]; sources: Source[] }> {
  const c = await collections();
  const [sportDocs, sourceDocs] = await Promise.all([
    c.sports.find().sort({ name: 1 }).toArray(),
    c.sources.find().sort({ name: 1 }).toArray(),
  ]);
  return { sports: sportDocs.map((d) => toSport(d, sourceDocs)), sources: sourceDocs.map(toSource) };
}

async function loadSettings(): Promise<SiteSettings> {
  const c = await collections();
  return toSettings(await c.settings.findOne({ _id: 'site' }));
}

// ── Public site (only 已發布 events ever leave the server) ───────────────────

export interface PublicData {
  events: EventItem[];
  sports: Sport[];
  sources: Source[];
  settings: SiteSettings;
}

export async function getPublicData(): Promise<PublicData> {
  await connection(); // always read fresh data at request time, never at build time
  const c = await collections();
  const [{ sports, sources }, settings, eventDocs] = await Promise.all([
    loadTaxonomy(),
    loadSettings(),
    c.events.find({ reviewStatus: '已發布' }).sort({ startDate: 1 }).toArray(),
  ]);
  return { events: eventDocs.map((d) => toEvent(d, sports)), sports, sources, settings };
}

export async function getPublishedEventCount(): Promise<number> {
  await connection();
  const c = await collections();
  return c.events.countDocuments({ reviewStatus: '已發布' });
}

export interface PublicEventDetail {
  event: EventItem;
  sourceName: string;
  sourceUrl: string;
  qualifiesFor: EventItem | null; // the event this one leads to
  qualifiedFrom: EventItem[]; // events that lead into this one
}

// cache(): generateMetadata and the page share one lookup per request.
export const getPublicEvent = cache(async (id: string): Promise<PublicEventDetail | null> => {
  await connection();
  const _id = parseObjectId(id);
  if (!_id) return null;
  const c = await collections();
  const doc = await c.events.findOne({ _id, reviewStatus: '已發布' });
  if (!doc) return null;
  const { sports, sources } = await loadTaxonomy();
  const [nextDoc, fromDocs] = await Promise.all([
    doc.qualifiesForId ? c.events.findOne({ _id: doc.qualifiesForId, reviewStatus: '已發布' }) : null,
    c.events.find({ qualifiesForId: _id, reviewStatus: '已發布' }).sort({ startDate: 1 }).toArray(),
  ]);
  const event = toEvent(doc, sports);
  const sport = sports.find((s) => s.id === event.sportId);
  const source = sources.find((s) => s.id === sport?.sourceId);
  return {
    event,
    sourceName: source?.name ?? '',
    sourceUrl: source?.url ?? '',
    qualifiesFor: nextDoc ? toEvent(nextDoc, sports) : null,
    qualifiedFrom: fromDocs.map((d) => toEvent(d, sports)),
  };
});

// ── Admin (route handlers check the session before calling these) ────────────

export async function getAllEvents(): Promise<EventItem[]> {
  const c = await collections();
  const { sports } = await loadTaxonomy();
  const docs = await c.events.find().sort({ startDate: -1 }).toArray();
  return docs.map((d) => toEvent(d, sports));
}

export async function getSportsAndSources() {
  return loadTaxonomy();
}

export async function getMembers() {
  const c = await collections();
  return (await c.members.find().sort({ role: 1, name: 1 }).toArray()).map(toMember);
}

export async function getChangelog() {
  const c = await collections();
  return (await c.changelog.find().sort({ time: -1 }).limit(CHANGELOG_LIMIT).toArray()).map(toChangelog);
}

export async function getReports() {
  const c = await collections();
  return (await c.reports.find().sort({ time: -1 }).toArray()).map(toReport);
}

export async function getSettings() {
  return loadSettings();
}
