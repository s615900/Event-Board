'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { api, type ApiResult } from './api-client';
import { taipeiToday } from './dates';
import type { ChangeLogEntry, ErrorReport, EventItem, Member, SiteSettings, Source, Sport } from './types';

// Admin-only data store: mounted inside the signed-in admin layout, filled from
// the staff-only API, and never written to browser storage.

const EMPTY_SETTINGS: SiteSettings = { showEnded: false, allowGuestReport: false, pinFeatured: true, sortBy: '依日期', viewMode: '條列' };

interface AdminData {
  events: EventItem[];
  sports: Sport[];
  sources: Source[];
  members: Member[];
  changelog: ChangeLogEntry[];
  reports: ErrorReport[];
  settings: SiteSettings;
}

interface DataContextValue extends AdminData {
  loading: boolean;
  today: string;
  reload: () => Promise<void>;
  notify: (message: string, tone?: 'ok' | 'error') => void;
  // Runs a mutation, then reloads everything (so the changelog etc. stay in sync).
  // Returns true on success; on failure shows the server's message.
  mutate: (action: () => Promise<ApiResult>, successMessage: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | null>(null);

async function fetchAll(): Promise<AdminData> {
  const [events, sports, sources, members, changelog, reports, settings] = await Promise.all([
    api.get<EventItem[]>('/api/events'),
    api.get<Sport[]>('/api/sports'),
    api.get<Source[]>('/api/sources'),
    api.get<Member[]>('/api/members'),
    api.get<ChangeLogEntry[]>('/api/changelog'),
    api.get<ErrorReport[]>('/api/reports'),
    api.get<SiteSettings>('/api/settings'),
  ]);
  return {
    events: events.ok ? events.data : [],
    sports: sports.ok ? sports.data : [],
    sources: sources.ok ? sources.data : [],
    members: members.ok ? members.data : [],
    changelog: changelog.ok ? changelog.data : [],
    reports: reports.ok ? reports.data : [],
    settings: settings.ok ? settings.data : EMPTY_SETTINGS,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData>({ events: [], sports: [], sources: [], members: [], changelog: [], reports: [], settings: EMPTY_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ message: string; tone: 'ok' | 'error' } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let cancelled = false;
    fetchAll().then((next) => {
      if (cancelled) return;
      setData(next);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const reload = useCallback(async () => { setData(await fetchAll()); }, []);
  const notify = useCallback((message: string, tone: 'ok' | 'error' = 'ok') => setNotice({ message, tone }), []);
  const mutate = useCallback(async (action: () => Promise<ApiResult>, successMessage: string) => {
    const result = await action();
    if (!result.ok) { notify(result.error, 'error'); return false; }
    await reload();
    notify(successMessage);
    return true;
  }, [notify, reload]);

  const value: DataContextValue = { ...data, loading, today: taipeiToday(), reload, notify, mutate };

  return <DataContext.Provider value={value}>
    {children}
    {notice && <div data-testid="status-toast" role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-2 rounded-xl bg-[#17364a] px-4 py-3 text-sm font-semibold text-[#f7f1e5] shadow-xl">{notice.tone === 'error' ? <TriangleAlert size={16} className="shrink-0 text-[#f5ca6e]" /> : <Check size={16} className="shrink-0 text-[#f07b60]" />}{notice.message}</div>}
  </DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
