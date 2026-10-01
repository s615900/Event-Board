'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, List, MapPin, Search } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/ui';
import { eventStatus, monthGrid, monthLabel, shiftMonth, shortDate, weekdayZh } from '@/lib/dates';
import { COUNTIES, SCHOOL_LEVELS, TIERS } from '@/lib/options';
import type { EventItem, EventStatus, Sport } from '@/lib/types';

type ListEvent = EventItem & { status: EventStatus };
type View = 'list' | 'calendar';

export interface EventFilters {
  q: string;
  level: string;
  sport: string;
  county: string;
  tier: string;
  status: string;
  view: View;
}

const EMPTY_FILTERS: Omit<EventFilters, 'view'> = { q: '', level: '', sport: '', county: '', tier: '', status: '' };

export function EventsPage({ events, sports, today, initialFilters }: { events: EventItem[]; sports: Sport[]; today: string; initialFilters: EventFilters }) {
  const [filters, setFilters] = useState<EventFilters>(initialFilters);
  const set = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => setFilters(old => ({ ...old, [key]: value }));

  // Keep the address bar in sync so a filtered view can be bookmarked or shared.
  useEffect(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value && !(key === 'view' && value === 'list')) params.set(key, value);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/events?${qs}` : '/events');
  }, [filters]);

  const all = useMemo<ListEvent[]>(() => events.map(e => ({ ...e, status: eventStatus(e, today) })), [events, today]);
  const visible = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return all
      .filter(e => !q || `${e.name}${e.sportName}${e.county}${e.location}`.toLowerCase().includes(q))
      .filter(e => !filters.level || e.schoolLevels.includes(filters.level))
      .filter(e => !filters.sport || e.sportName === filters.sport)
      .filter(e => !filters.county || e.county === filters.county)
      .filter(e => !filters.tier || e.tier === filters.tier)
      .filter(e => !filters.status || e.status === filters.status)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [all, filters]);
  const hasFilters = Object.entries(EMPTY_FILTERS).some(([key]) => filters[key as keyof EventFilters]);
  const reset = () => setFilters(old => ({ ...old, ...EMPTY_FILTERS }));

  const selectClass = 'min-w-0 rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-2.5 text-sm font-semibold outline-none';
  return <main className="page-enter mx-auto max-w-[1240px] px-5 py-10 lg:px-8 lg:py-16">
    <div className="flex flex-col justify-between gap-5 border-b border-[#d9cfc1] pb-8 md:flex-row md:items-end"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">EVENT INDEX</p><h1 className="mt-2 font-display text-6xl font-bold leading-none text-[#17364a]">全部賽事</h1><p className="mt-3 text-sm text-[#718083]">全台國小、國中、高中運動賽事，持續更新。</p></div><div className="font-mono-custom text-xs text-[#087f8c]">{visible.length.toString().padStart(2, '0')} RESULTS</div></div>

    <div className="mt-8 rounded-2xl border border-[#d9cfc1] bg-[#ebe4d7] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div role="group" aria-label="學制" className="flex shrink-0 rounded-xl bg-[#f8f4ec] p-1" data-testid="group-level">
          {['', ...SCHOOL_LEVELS].map(level => <button key={level || 'all'} type="button" onClick={() => set('level', level)} aria-pressed={filters.level === level} data-testid={`button-level-${level || '全部'}`} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${filters.level === level ? 'bg-[#17364a] text-white' : 'text-[#53636a] hover:bg-[#ebe4d7]'}`}>{level || '全部'}</button>)}
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#f8f4ec] px-3"><Search size={17} className="shrink-0 text-[#788587]" /><input value={filters.q} onChange={e => set('q', e.target.value)} data-testid="input-event-search" placeholder="搜尋名稱、運動或地點" className="w-full bg-transparent px-1 py-2.5 text-sm outline-none" /></div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select value={filters.sport} onChange={e => set('sport', e.target.value)} aria-label="運動" data-testid="select-event-sport" className={selectClass}><option value="">全部運動</option>{sports.map(s => <option key={s.id}>{s.name}</option>)}</select>
        <select value={filters.county} onChange={e => set('county', e.target.value)} aria-label="縣市" data-testid="select-event-county" className={selectClass}><option value="">全部縣市</option>{COUNTIES.map(c => <option key={c}>{c}</option>)}</select>
        <select value={filters.tier} onChange={e => set('tier', e.target.value)} aria-label="賽事層級" data-testid="select-event-tier" className={selectClass}><option value="">全部層級</option>{TIERS.map(t => <option key={t} value={t}>{t}級</option>)}</select>
        <select value={filters.status} onChange={e => set('status', e.target.value)} aria-label="狀態" data-testid="select-event-status" className={selectClass}><option value="">全部狀態</option><option>即將舉行</option><option>進行中</option><option>已結束</option></select>
      </div>
    </div>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs text-[#8b8277]">{hasFilters ? <>已套用篩選 · <button type="button" onClick={reset} data-testid="button-reset-filters-top" className="font-bold text-[#087f8c] underline">清除篩選</button></> : '顯示公開且通過審核的賽事'}</div>
      <div role="group" aria-label="檢視方式" className="flex rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] p-0.5">
        <button type="button" onClick={() => set('view', 'list')} aria-pressed={filters.view === 'list'} data-testid="button-view-list" className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold ${filters.view === 'list' ? 'bg-[#17364a] text-white' : 'text-[#53636a]'}`}><List size={14} />列表</button>
        <button type="button" onClick={() => set('view', 'calendar')} aria-pressed={filters.view === 'calendar'} data-testid="button-view-calendar" className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold ${filters.view === 'calendar' ? 'bg-[#17364a] text-white' : 'text-[#53636a]'}`}><CalendarDays size={14} />月曆</button>
      </div>
    </div>

    {filters.view === 'calendar'
      ? <CalendarView events={visible} today={today} />
      : visible.length > 0 ? <MonthList events={visible} /> : <EmptyState title="找不到符合條件的賽事" detail="試試調整學制、縣市或其他篩選條件，賽事資料會持續增加。" onReset={reset} />}
  </main>;
}

// ── List view: collapsible month sections; past months start collapsed ─────

function MonthList({ events }: { events: ListEvent[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, ListEvent[]>();
    for (const e of events) {
      const month = e.startDate.slice(0, 7);
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(e);
    }
    return Array.from(map.entries());
  }, [events]);
  // Months still in play come first (soonest first); fully finished months go
  // to the bottom, newest first, collapsed.
  const active = groups.filter(([, items]) => items.some(e => e.status !== '已結束'));
  const past = groups.filter(([, items]) => items.every(e => e.status === '已結束')).reverse();
  return <div className="mt-4 space-y-4" data-testid="view-event-list">
    {active.map(([month, items]) => <MonthSection key={month} month={month} items={items} open />)}
    {active.length === 0 && <p className="rounded-xl border border-dashed border-[#cfc3b5] px-4 py-8 text-center text-sm text-[#8b8277]">目前沒有即將舉行的賽事。</p>}
    {past.length > 0 && <div className="pt-6" data-testid="section-past-months"><h2 className="mb-3 text-sm font-bold text-[#8b8277]">已結束的賽事</h2><div className="space-y-3">{past.map(([month, items]) => <MonthSection key={month} month={month} items={items} open={false} />)}</div></div>}
  </div>;
}

function MonthSection({ month, items, open }: { month: string; items: ListEvent[]; open: boolean }) {
  return <details open={open} data-testid={`month-section-${month}`} className="group rounded-2xl border border-[#d9cfc1] bg-[#f4efe5]">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-4 hover:bg-[#ebe4d7] [&::-webkit-details-marker]:hidden"><span className="flex items-baseline gap-3"><span className={`font-display font-bold ${open ? 'text-2xl text-[#17364a]' : 'text-xl text-[#53636a]'}`}>{monthLabel(month)}</span><span className="font-mono-custom text-xs text-[#8b8277]">{items.length} 場</span></span><ChevronDown size={18} className="shrink-0 text-[#718083] transition group-open:rotate-180" /></summary>
    <div className="grid gap-2 px-3 pb-3">{items.map(e => <EventRow key={e.id} event={e} />)}</div>
  </details>;
}

function EventRow({ event }: { event: ListEvent }) {
  const multiDay = event.endDate && event.endDate !== event.startDate;
  const meta = [event.county, event.location, event.schoolLevels.join('、')].filter(Boolean);
  return <Link href={`/events/${event.id}`} data-testid={`row-public-event-${event.id}`} className={`event-row grid grid-cols-[76px_1fr] gap-4 rounded-xl border border-[#ddd3c5] bg-[#f8f4ec] p-4 md:grid-cols-[96px_1fr_auto] md:items-center ${event.status === '已結束' ? 'opacity-70' : ''}`}>
    <div className="border-l-4 pl-3" style={{ borderColor: event.sportColor }}><span className="block font-mono-custom text-xl font-bold leading-tight text-[#17364a]">{shortDate(event.startDate)}</span><span className="block text-[11px] font-bold text-[#918d84]">週{weekdayZh(event.startDate)}{multiDay ? ` – ${shortDate(event.endDate)}` : ''}</span></div>
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5">{event.sportName && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: event.sportColor }}>{event.sportName}</span>}<StatusBadge status={event.status} />{event.tier && <span className="rounded-full border border-[#d4c9ba] px-2 py-0.5 text-[10px] font-bold text-[#53636a]">{event.tier}級</span>}{event.important && <span className="rounded-full bg-[#f9e7c3] px-2 py-0.5 text-[10px] font-bold text-[#9a6917]">重點</span>}</div><h3 data-testid={`text-event-name-${event.id}`} className="mt-1.5 text-base font-bold leading-snug text-[#273f4b]">{event.name}</h3>{meta.length > 0 && <p className="mt-1 flex items-start gap-1 text-xs text-[#7b8584]"><MapPin size={13} className="mt-0.5 shrink-0" /><span>{meta.join(' · ')}</span></p>}</div>
    <ChevronRight className="hidden text-[#9b9c92] md:block" size={20} />
  </Link>;
}

// ── Calendar view ────────────────────────────────────────────────────────────

const WEEK_HEADER = ['日', '一', '二', '三', '四', '五', '六'];
const MAX_CHIPS = 3;

function CalendarView({ events, today }: { events: ListEvent[]; today: string }) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const cells = useMemo(() => monthGrid(month), [month]);
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-31`;
  // Events overlapping this month (multi-day events appear on every day they run).
  const inMonth = events.filter(e => e.startDate <= monthEnd && (e.endDate || e.startDate) >= monthStart);
  const onDay = (day: string) => inMonth.filter(e => e.startDate <= day && (e.endDate || e.startDate) >= day);
  return <div className="mt-4" data-testid="view-event-calendar">
    <div className="flex items-center justify-between rounded-t-2xl border border-b-0 border-[#d9cfc1] bg-[#17364a] px-4 py-3 text-white">
      <button type="button" onClick={() => setMonth(m => shiftMonth(m, -1))} aria-label="上個月" data-testid="button-prev-month" className="rounded-lg p-2 hover:bg-[#23495b]"><ChevronLeft size={18} /></button>
      <div className="text-center"><p className="font-display text-2xl font-bold" data-testid="text-calendar-month">{monthLabel(month)}</p>{month !== today.slice(0, 7) && <button type="button" onClick={() => setMonth(today.slice(0, 7))} className="text-[11px] font-bold text-[#f5ca6e] underline">回到本月</button>}</div>
      <button type="button" onClick={() => setMonth(m => shiftMonth(m, 1))} aria-label="下個月" data-testid="button-next-month" className="rounded-lg p-2 hover:bg-[#23495b]"><ChevronRight size={18} /></button>
    </div>
    <div className="grid grid-cols-7 border-l border-t border-[#d9cfc1] bg-[#f8f4ec]">
      {WEEK_HEADER.map(d => <div key={d} className="border-b border-r border-[#d9cfc1] bg-[#ebe4d7] py-2 text-center text-[11px] font-bold text-[#718083]">{d}</div>)}
      {cells.map((day, i) => {
        if (!day) return <div key={`blank-${i}`} className="min-h-16 border-b border-r border-[#d9cfc1] bg-[#efe9df] sm:min-h-28" />;
        const items = onDay(day);
        return <div key={day} className={`min-h-16 border-b border-r border-[#d9cfc1] p-1 sm:min-h-28 sm:p-1.5 ${day === today ? 'bg-[#fff6e6]' : ''}`}>
          <p className={`mb-1 text-right font-mono-custom text-[11px] font-bold ${day === today ? 'text-[#ed7659]' : 'text-[#8b8277]'}`}>{day === today ? <span className="rounded-full bg-[#ed7659] px-1.5 text-white">{Number(day.slice(8))}</span> : Number(day.slice(8))}</p>
          <div className="space-y-0.5">
            {items.slice(0, MAX_CHIPS).map(e => <Link key={e.id} href={`/events/${e.id}`} title={e.name} className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] font-semibold leading-tight text-[#273f4b] hover:bg-[#ebe4d7] sm:text-[11px]" style={{ backgroundColor: `${e.sportColor}1f` }}><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: e.sportColor }} /><span className="hidden truncate sm:inline">{e.name}</span></Link>)}
            {items.length > MAX_CHIPS && <p className="px-1 text-[10px] font-bold text-[#8b8277]">+{items.length - MAX_CHIPS}</p>}
          </div>
        </div>;
      })}
    </div>
    <div className="mt-6">
      <h2 className="text-sm font-bold text-[#53636a]">{monthLabel(month)}的賽事（{inMonth.length} 場）</h2>
      {inMonth.length ? <div className="mt-3 grid gap-2">{inMonth.map(e => <EventRow key={e.id} event={e} />)}</div> : <p className="mt-3 rounded-xl border border-dashed border-[#cfc3b5] px-4 py-8 text-center text-sm text-[#8b8277]">這個月沒有符合條件的賽事。</p>}
    </div>
  </div>;
}
