'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, FilePlus2, MapPin, Search } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/ui';
import { eventStatus, shortDate, weekdayZh } from '@/lib/dates';
import { SCHOOL_LEVELS } from '@/lib/options';
import type { EventItem, EventStatus, SiteSettings, SortBy, Sport } from '@/lib/types';

type HomeEvent = EventItem & { status: EventStatus };

export function Home({ events, sports, settings, today }: { events: EventItem[]; sports: Sport[]; settings: SiteSettings; today: string }) {
  const all = useMemo<HomeEvent[]>(() => events.map(e => ({ ...e, status: eventStatus(e, today) })), [events, today]);
  const visible = all.filter(e => settings.showEnded || e.status !== '已結束');
  const featured = visible.filter(e => e.important);
  // Hero panel: what's on now, then the soonest upcoming events.
  const upcoming = all.filter(e => e.status !== '已結束').sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, UPCOMING_LIMIT);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searchHref = `/events${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`;
  return <main className="page-enter"><section className="relative overflow-hidden bg-[#17364a] text-[#f8f4ec]"><div className="stripe absolute inset-0 opacity-60" /><div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 py-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-14 lg:px-8 lg:py-16">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold tracking-[.18em] text-[#f07b60]"><span className="h-2 w-2 rounded-full bg-[#f07b60]" /><span data-testid="text-home-event-count">{events.length} 場賽事 · 持續更新中</span></p>
        <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.15] tracking-wide sm:text-6xl">全台學生運動賽事<br /><span className="text-[#ef7458]">一次掌握</span></h1>
        <p className="mt-5 max-w-lg text-base leading-8 text-[#c7d4d3]">國小、國中、高中的各項運動比賽，從縣市選拔到全國錦標賽，都整理在這裡。</p>
        <div className="mt-8 flex max-w-xl flex-col gap-2 rounded-xl bg-[#f8f4ec] p-2 text-[#213746] shadow-2xl sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-2"><Search size={20} className="ml-3 shrink-0 text-[#7c8887]" /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') router.push(searchHref); }} data-testid="input-home-search" placeholder="搜尋賽事、運動種類或地點..." className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none" /></div><Link href={searchHref} data-testid="link-home-search" className="shrink-0 rounded-lg bg-[#ed7659] px-5 py-3 text-center text-sm font-bold text-white hover:bg-[#d95e49]">開始找</Link></div>
        <div className="mt-5 flex flex-wrap items-center gap-2" data-testid="group-home-levels"><span className="text-xs font-bold text-[#8da7aa]">依學制找：</span>{SCHOOL_LEVELS.map(level => <Link key={level} href={`/events?level=${encodeURIComponent(level)}`} data-testid={`link-home-level-${level}`} className="rounded-full border border-[#55737a] px-5 py-2 text-sm font-bold text-[#f8f4ec] transition hover:border-[#ed7659] hover:bg-[#ed7659]">{level}</Link>)}</div>
      </div>
      <UpcomingPanel events={upcoming} />
    </div></section><section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20"><div className="mb-8 flex items-end justify-between"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">CURATED PICKS / 01</p><h2 className="mt-2 font-display text-4xl font-bold tracking-wide text-[#17364a]">本週值得關注</h2></div><Link href="/events" data-testid="link-home-all-events" className="hidden items-center gap-1 text-sm font-bold text-[#087f8c] md:flex">查看全部 <ChevronRight size={17} /></Link></div>{visible.length === 0 ? <EmptyState title="目前還沒有公開的賽事" detail="賽事經審核發布後就會出現在這裡。" /> : <div className="grid gap-5 md:grid-cols-2">{(featured.length ? featured : visible.slice(0, 2)).map((event, i) => <EventFeatureCard key={event.id} event={event} index={i} />)}</div>}</section><HomeListing events={visible} settings={settings} /><section className="border-y border-[#ded5c8] bg-[#ebe4d7]"><div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-12 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">BROWSE BY SPORT</p><h2 className="mt-2 font-display text-4xl font-bold text-[#17364a]">照你的節奏<br />挑一場。</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{sports.slice(0, 8).map(s => <Link href={`/events?sport=${encodeURIComponent(s.name)}`} key={s.id} data-testid={`link-sport-${s.id}`} className="group flex min-h-24 flex-col justify-between rounded-xl border border-[#d6ccbd] bg-[#f8f4ec] p-4 transition hover:-translate-y-1 hover:border-[#087f8c]"><span className="h-2 w-8 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-sm font-bold text-[#354b55] group-hover:text-[#087f8c]">{s.name}</span><span className="font-mono-custom text-[10px] text-[#918d84]">{events.filter(e => e.sportId === s.id).length.toString().padStart(2, '0')} EVENTS</span></Link>)}</div></div></section><section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8"><div className="flex flex-col gap-7 rounded-2xl bg-[#ed7659] p-7 text-[#fff8ee] md:flex-row md:items-center md:justify-between md:p-10"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ffe2d6]">FOR ORGANIZERS</p><h2 className="mt-2 font-display text-4xl font-bold">有一場賽事要讓大家知道？</h2><p className="mt-2 text-sm text-[#ffe2d6]">提交活動資訊，讓更多選手準時到場。</p></div><Link href="/admin/events" data-testid="link-submit-event" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17364a] px-5 py-3 text-sm font-bold text-[#f8f4ec] hover:bg-[#0d5265]">前往賽事管理 <FilePlus2 size={17} /></Link></div></section></main>;
}

const UPCOMING_LIMIT = 4;

function UpcomingPanel({ events }: { events: HomeEvent[] }) {
  return <div className="rounded-2xl border border-[#355665] bg-[#1d3f54]/90 p-5 shadow-[10px_10px_0_#0d2837] sm:p-6" data-testid="panel-home-upcoming">
    <div className="flex items-center justify-between border-b border-[#355665] pb-3"><p className="text-sm font-bold">即將舉行</p><span className="font-mono-custom text-[10px] tracking-[.18em] text-[#8da7aa]">UP NEXT</span></div>
    {events.length === 0 ? <p className="py-8 text-center text-sm text-[#aabdc1]">目前沒有即將舉行的賽事。</p> : <ul className="divide-y divide-[#2c4f61]">{events.map(e => <li key={e.id}><Link href={`/events/${e.id}`} data-testid={`link-upcoming-${e.id}`} className="group flex items-center gap-4 py-3.5"><div className="w-14 shrink-0 text-center"><p className="font-mono-custom text-lg font-bold leading-none">{shortDate(e.startDate)}</p><p className="mt-1 text-[11px] text-[#8da7aa]">週{weekdayZh(e.startDate)}</p></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-[#f5ca6e]">{e.name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-[#aabdc1]"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.sportColor }} />{[e.sportName, e.county].filter(Boolean).join(' · ')}{e.status === '進行中' && <span className="rounded-full bg-[#ed7659] px-1.5 text-[10px] font-bold text-white">進行中</span>}</p></div><ChevronRight size={16} className="shrink-0 text-[#55737a] group-hover:text-[#f5ca6e]" /></Link></li>)}</ul>}
    <Link href="/events" data-testid="link-upcoming-all" className="mt-2 flex items-center justify-end gap-1 text-xs font-bold text-[#f5ca6e]">看全部賽事 <ChevronRight size={14} /></Link>
  </div>;
}

function sortEvents(list: HomeEvent[], sortBy: SortBy): HomeEvent[] {
  const arr = [...list];
  if (sortBy === '依運動項目') arr.sort((a, b) => a.sportName.localeCompare(b.sportName, 'zh-Hant') || a.startDate.localeCompare(b.startDate));
  else if (sortBy === '依狀態') { const order: Record<EventStatus, number> = { '進行中': 0, '即將舉行': 1, '已結束': 2 }; arr.sort((a, b) => order[a.status] - order[b.status] || a.startDate.localeCompare(b.startDate)); }
  else arr.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return arr;
}

function groupByMonth(list: HomeEvent[], pinFeatured: boolean): { month: string; events: HomeEvent[] }[] {
  const groups = new Map<string, HomeEvent[]>();
  for (const e of list) {
    const month = e.startDate.slice(0, 7) || '未定';
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(e);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, evs]) => ({
    month,
    events: pinFeatured ? [...evs].sort((a, b) => Number(b.important) - Number(a.important)) : evs,
  }));
}

function HomeListing({ events, settings }: { events: HomeEvent[]; settings: SiteSettings }) {
  const grouped = useMemo(() => groupByMonth(sortEvents(events, settings.sortBy), settings.pinFeatured), [events, settings.sortBy, settings.pinFeatured]);
  return <section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20" data-testid="section-home-listing"><div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">EVENT CALENDAR</p><h2 className="mt-2 font-display text-4xl font-bold tracking-wide text-[#17364a]">近期賽事</h2></div><Link href="/events?view=calendar" data-testid="link-home-calendar" className="text-sm font-bold text-[#087f8c]">看月曆 →</Link></div>{grouped.length === 0 && <EmptyState title="目前沒有符合條件的賽事" detail="賽事經審核發布後就會出現在這裡。" />}{settings.viewMode === '行事曆' ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="view-home-calendar">{grouped.map(g => <div key={g.month} data-testid={`month-group-${g.month}`} className="rounded-2xl border border-[#d9cfc1] bg-[#f8f4ec] p-5"><p className="font-mono-custom text-xs font-bold text-[#087f8c]">{g.month}</p><div className="mt-3 space-y-3">{g.events.map(e => <HomeEventEntry key={e.id} event={e} settings={settings} />)}</div></div>)}</div> : <div className="space-y-8" data-testid="view-home-list">{grouped.map(g => <div key={g.month} data-testid={`month-group-${g.month}`}><p className="mb-3 font-mono-custom text-xs font-bold text-[#087f8c]">{g.month}</p><div className="grid gap-3">{g.events.map(e => <HomeEventEntry key={e.id} event={e} settings={settings} />)}</div></div>)}</div>}</section>;
}

function HomeEventEntry({ event, settings }: { event: HomeEvent; settings: SiteSettings }) {
  return <div data-testid={`row-home-event-${event.id}`} className="flex items-center gap-3 rounded-xl border border-[#ddd3c5] bg-[#f8f4ec] p-4"><Link href={`/events/${event.id}`} className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold text-[#087f8c]">{event.sportName}</span>{event.important && <span data-testid={`badge-important-${event.id}`} className="rounded-full bg-[#f9e7c3] px-2 py-0.5 text-[10px] font-bold text-[#9a6917]">重點</span>}<StatusBadge status={event.status} /></div><h3 className="mt-1 truncate text-sm font-bold text-[#273f4b]">{event.name}</h3><p className="mt-1 text-xs text-[#7b8584]">{[event.startDate, event.schoolLevels.join('、'), event.county].filter(Boolean).join(' · ')}</p></Link>{settings.allowGuestReport && <Link href={`/events/${event.id}#report`} data-testid={`link-report-error-${event.id}`} className="shrink-0 rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-1.5 text-[11px] font-bold text-[#b14f3b] hover:border-[#b14f3b]">回報錯誤</Link>}</div>;
}

function EventFeatureCard({ event, index }: { event: EventItem; index: number }) {
  return <Link href={`/events/${event.id}`} data-testid={`card-featured-event-${event.id}`} className={`group relative overflow-hidden rounded-2xl border border-[#d8cec1] bg-[#f8f4ec] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${index === 0 ? 'md:row-span-2 md:p-8' : ''}`}><div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full opacity-20" style={{ backgroundColor: event.sportColor }} /><div className="relative flex h-full flex-col"><div className="flex items-center justify-between"><span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: event.sportColor }}>{event.sportName || '賽事'}</span><span className="font-mono-custom text-[11px] text-[#8b8277]">{event.startDate.replaceAll('-', '.')}</span></div><h3 className={`mt-7 max-w-md font-display font-bold leading-[.95] text-[#17364a] ${index === 0 ? 'text-5xl md:text-6xl' : 'text-4xl'}`}>{event.name}</h3><div className="mt-auto flex items-end justify-between pt-10"><span className="flex items-center gap-1.5 text-xs font-semibold text-[#68777b]"><MapPin size={14} className="text-[#ed7659]" />{[event.county, event.location].filter(Boolean).join(' ')}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#17364a] text-white transition group-hover:bg-[#087f8c]"><ChevronRight size={17} /></span></div></div></Link>;
}
