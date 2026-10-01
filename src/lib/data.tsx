'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { fetchRagicRecords, toChangeLog, toEvents, toMembers, toReports, toSettings, toSources, toSports } from './ragic-client';
import { useAuth } from './auth';
import { seedEvents, seedSettings, seedSources, seedSports } from './seed';
import type { ChangeLogEntry, ErrorReport, EventItem, Member, Setter, SiteSettings, Source, Sport } from './types';

// Server render and the first client render both use `initial`; the cached
// copy in localStorage is applied after mount so hydration markup matches.
function useStored<T>(key: string, initial: T): [T, Setter<T>] {
  const storageKey = `sports-board-${key}`;
  const [value, setValue] = useState<T>(initial);
  const restored = useRef(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage after hydration
      if (saved) setValue(JSON.parse(saved) as T);
    } catch {
      // unreadable storage: keep the initial value
    }
    restored.current = true;
  }, [storageKey]);
  useEffect(() => {
    if (!restored.current) return;
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* storage full or blocked */ }
  }, [storageKey, value]);
  return [value, setValue];
}

interface DataContextValue {
  events: EventItem[]; setEvents: Setter<EventItem[]>;
  sources: Source[]; setSources: Setter<Source[]>;
  sports: Sport[]; setSports: Setter<Sport[]>;
  members: Member[]; setMembers: Setter<Member[]>;
  changelog: ChangeLogEntry[];
  reports: ErrorReport[]; setReports: Setter<ErrorReport[]>;
  settings: SiteSettings; setSettings: Setter<SiteSettings>;
  notify: (message: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useStored<EventItem[]>('events', seedEvents);
  const [sources, setSources] = useStored<Source[]>('sources', seedSources);
  const [sports, setSports] = useStored<Sport[]>('sports', seedSports);
  // Staff-only data: loaded after sign-in, never cached in browser storage.
  const [members, setMembers] = useState<Member[]>([]);
  const [changelog, setChangelog] = useState<ChangeLogEntry[]>([]);
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const { status } = useAuth();
  const [settings, setSettings] = useStored<SiteSettings>('settings', seedSettings);
  const [notice, setNotice] = useState('');

  // Earlier versions cached the member roster, changelog and reports in
  // localStorage for every visitor; clear those leftovers.
  useEffect(() => {
    try {
      for (const key of ['members', 'changelog', 'reports']) localStorage.removeItem(`sports-board-${key}`);
    } catch { /* storage blocked */ }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    (async () => {
      const [sourceRecords, sportRecords, eventRecords, settingsRecords] = await Promise.all([
        fetchRagicRecords('/api/sources'),
        fetchRagicRecords('/api/sports'),
        fetchRagicRecords('/api/events'),
        fetchRagicRecords('/api/settings'),
      ]);
      const nextSources = sourceRecords ? toSources(sourceRecords) : null;
      const nextSports = sportRecords ? toSports(sportRecords) : null;
      if (nextSources) setSources(nextSources);
      if (nextSports) setSports(nextSports);
      if (eventRecords) setEvents(toEvents(eventRecords, nextSports ?? sports));
      if (settingsRecords) setSettings(toSettings(settingsRecords, seedSettings));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== 'authed') return;
    let cancelled = false;
    Promise.all([
      fetchRagicRecords('/api/members'),
      fetchRagicRecords('/api/changelog'),
      fetchRagicRecords('/api/reports'),
    ]).then(([memberRecords, changelogRecords, reportRecords]) => {
      if (cancelled) return;
      setMembers(memberRecords ? toMembers(memberRecords) : []);
      setChangelog(changelogRecords ? toChangeLog(changelogRecords) : []);
      setReports(reportRecords ? toReports(reportRecords) : []);
    });
    return () => {
      cancelled = true;
      // Drop staff data once signed out so it doesn't linger in memory.
      setMembers([]);
      setChangelog([]);
      setReports([]);
    };
  }, [status]);

  const value: DataContextValue = {
    events, setEvents, sources, setSources, sports, setSports, members, setMembers,
    changelog, reports, setReports, settings, setSettings, notify: setNotice,
  };

  return <DataContext.Provider value={value}>
    {children}
    {notice && <div data-testid="status-toast" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl bg-[#17364a] px-4 py-3 text-sm font-semibold text-[#f7f1e5] shadow-xl"><Check size={16} className="text-[#f07b60]" />{notice}</div>}
  </DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
