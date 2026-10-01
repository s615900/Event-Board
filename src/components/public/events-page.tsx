'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, MapPin, Search } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/ui';
import { eventStatus, weekdayZh } from '@/lib/dates';
import type { EventItem, EventStatus, Sport } from '@/lib/types';

type ListEvent = EventItem & { status: EventStatus };

export function EventsPage({ events, sports, today, initialQuery, initialSport }: { events: EventItem[]; sports: Sport[]; today: string; initialQuery: string; initialSport: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [sport, setSport] = useState(initialSport || '全部運動');
  const [status, setStatus] = useState('全部狀態');
  const [year, setYear] = useState('');
  const all = useMemo<ListEvent[]>(() => events.map(e => ({ ...e, status: eventStatus(e, today) })), [events, today]);
  const years = useMemo(() => Array.from(new Set(all.map(e => e.startDate.slice(0, 4)).filter(Boolean))).sort(), [all]);
  const visible = useMemo(() => all
    .filter(e => !query || `${e.name}${e.sportName}${e.county}${e.location}`.toLowerCase().includes(query.toLowerCase()))
    .filter(e => sport === '全部運動' || e.sportName === sport)
    .filter(e => status === '全部狀態' || e.status === status)
    .filter(e => !year || e.startDate.startsWith(year))
    .sort((a, b) => a.startDate.localeCompare(b.startDate)), [all, query, sport, status, year]);
  return <main className="page-enter mx-auto max-w-[1240px] px-5 py-10 lg:px-8 lg:py-16"><div className="flex flex-col justify-between gap-5 border-b border-[#d9cfc1] pb-8 md:flex-row md:items-end"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">EVENT INDEX</p><h1 className="mt-2 font-display text-6xl font-bold leading-none text-[#17364a]">全部賽事</h1><p className="mt-3 text-sm text-[#718083]">全台國小、國中、高中運動賽事，持續更新。</p></div><div className="font-mono-custom text-xs text-[#087f8c]">{visible.length.toString().padStart(2, '0')} RESULTS</div></div><div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#d9cfc1] bg-[#ebe4d7] p-4 md:flex-row md:items-center"><div className="flex flex-1 items-center gap-2 rounded-lg bg-[#f8f4ec] px-3"><Search size={17} className="text-[#788587]" /><input value={query} onChange={e => setQuery(e.target.value)} data-testid="input-event-search" placeholder="搜尋名稱、運動或地點" className="w-full bg-transparent px-1 py-3 text-sm outline-none" /></div><div className="flex gap-2 overflow-x-auto"><select value={sport} onChange={e => setSport(e.target.value)} data-testid="select-event-sport" className="rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-3 text-sm font-semibold outline-none"><option>全部運動</option>{sports.map(s => <option key={s.id}>{s.name}</option>)}</select><select value={status} onChange={e => setStatus(e.target.value)} data-testid="select-event-status" className="rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-3 text-sm font-semibold outline-none"><option>全部狀態</option><option>即將舉行</option><option>進行中</option><option>已結束</option></select><select value={year} onChange={e => setYear(e.target.value)} data-testid="select-event-year" className="rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-3 text-sm font-semibold outline-none"><option value="">全部年份</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div></div><div className="mt-7 flex items-center gap-2 text-xs text-[#8b8277]"><Filter size={14} /> 已顯示公開且通過審核的賽事</div><div className="mt-3 grid gap-3">{visible.map(event => <PublicEventRow event={event} key={event.id} />)}</div>{visible.length === 0 && <EmptyState title="找不到符合條件的賽事" detail="試試調整關鍵字或篩選條件，賽事資料會持續增加。" onReset={() => { setQuery(''); setSport('全部運動'); setStatus('全部狀態'); setYear(''); }} />}</main>;
}

function PublicEventRow({ event }: { event: ListEvent }) {
  const meta = [[event.county, event.location].filter(Boolean).join(' '), event.schoolLevels.join('、'), event.tier && `${event.tier}級`].filter(Boolean);
  return <Link href={`/events/${event.id}`} data-testid={`row-public-event-${event.id}`} className="event-row grid gap-4 rounded-xl border border-[#ddd3c5] bg-[#f8f4ec] p-4 md:grid-cols-[100px_1fr_auto] md:items-center"><div className="border-l-4 border-[#ed7659] pl-3"><span className="font-mono-custom text-2xl font-bold text-[#17364a]">{event.startDate.slice(5, 7)}<small className="text-xs"> / {event.startDate.slice(8)}</small></span><span className="block text-[10px] font-bold tracking-wider text-[#918d84]">{event.startDate.slice(0, 4)}（週{weekdayZh(event.startDate)}）</span></div><div><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold text-[#087f8c]">{event.sportName}</span><StatusBadge status={event.status} /></div><h3 data-testid={`text-event-name-${event.id}`} className="mt-1 text-base font-bold text-[#273f4b]">{event.name}</h3>{meta.length > 0 && <p className="mt-1 flex items-center gap-1 text-xs text-[#7b8584]"><MapPin size={13} />{meta.join(' · ')}</p>}</div><ChevronRight className="hidden text-[#9b9c92] md:block" size={20} /></Link>;
}
