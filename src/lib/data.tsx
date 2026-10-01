'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { fetchRagicRecords, toChangeLog, toEvents, toMembers, toReports, toSettings, toSources, toSports } from './ragic-client';
import { seedEvents, seedMembers, seedSettings, seedSources, seedSports } from './seed';
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
  const [members, setMembers] = useStored<Member[]>('members', seedMembers);
  const [changelog, setChangelog] = useStored<ChangeLogEntry[]>('changelog', []);
  const [reports, setReports] = useStored<ErrorReport[]>('reports', []);
  const [settings, setSettings] = useStored<SiteSettings>('settings', seedSettings);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    (async () => {
      const [sourceRecords, sportRecords, eventRecords, memberRecords, changelogRecords, reportRecords, settingsRecords] = await Promise.all([
        fetchRagicRecords('/api/sources'),
        fetchRagicRecords('/api/sports'),
        fetchRagicRecords('/api/events'),
        fetchRagicRecords('/api/members'),
        fetchRagicRecords('/api/changelog'),
        fetchRagicRecords('/api/reports'),
        fetchRagicRecords('/api/settings'),
      ]);
      const nextSources = sourceRecords ? toSources(sourceRecords) : null;
      const nextSports = sportRecords ? toSports(sportRecords) : null;
      if (nextSources) setSources(nextSources);
      if (nextSports) setSports(nextSports);
      if (eventRecords) setEvents(toEvents(eventRecords, nextSports ?? sports));
      if (memberRecords) setMembers(toMembers(memberRecords));
      if (changelogRecords) setChangelog(toChangeLog(changelogRecords));
      if (reportRecords) setReports(toReports(reportRecords));
      if (settingsRecords) setSettings(toSettings(settingsRecords, seedSettings));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
