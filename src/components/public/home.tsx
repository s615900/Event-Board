'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, FilePlus2, MapPin, Search } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/ui';
import { useData } from '@/lib/data';
import { normalizeDate, useToday, weekdayEn } from '@/lib/dates';
import type { EventItem, SiteSettings, SortBy, Sport } from '@/lib/types';

export function Home() {
  const { events, sports, settings } = useData();
  const published = events.filter(e => e.reviewStatus === '已發布' && (settings.showEnded || e.status !== '已結束'));
  const featured = published.filter(e => e.important);
  const [query, setQuery] = useState('');
  const today = useToday();
  const nextUp = today
    ? [...published].filter(e => normalizeDate(e.startdate) >= today).sort((a, b) => normalizeDate(a.startdate).localeCompare(normalizeDate(b.startdate)))[0]
    : undefined;
  return <main className="page-enter"><section className="relative overflow-hidden bg-[#17364a] text-[#f8f4ec]"><div className="stripe absolute inset-0 opacity-80" /><div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 pb-16 pt-14 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-24 lg:pt-20"><div><p className="mb-5 flex items-center gap-2 text-xs font-bold tracking-[.22em] text-[#f07b60]"><span className="h-2 w-2 rounded-full bg-[#f07b60]" /> <span data-testid="text-home-event-count">{published.length} 場賽事 · 持續更新中</span></p><h1 className="font-display max-w-3xl text-[3.25rem] font-bold uppercase leading-[1.05] tracking-tight sm:text-[clamp(4rem,10vw,8.8rem)] sm:leading-[.82]">準備好<br /><span className="text-[#ef7458]">上場</span>了嗎？</h1><p className="mt-8 max-w-lg text-base leading-8 text-[#c7d4d3] break-words">找到下一場屬於你的賽事。從學校盃到全國公開賽，台灣各地的運動活動，現在一眼掌握。</p><div className="mt-9 flex max-w-xl flex-col gap-2 rounded-xl bg-[#f8f4ec] p-2 text-[#213746] shadow-2xl sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-2"><Search size={20} className="ml-3 shrink-0 text-[#7c8887]" /><input value={query} onChange={e => setQuery(e.target.value)} data-testid="input-home-search" placeholder="搜尋賽事、運動種類或地點..." className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none" /></div><Link href={`/events${query ? `?q=${encodeURIComponent(query)}` : ''}`} data-testid="link-home-search" className="shrink-0 rounded-lg bg-[#ed7659] px-5 py-3 text-center text-sm font-bold text-white hover:bg-[#d95e49]">開始找</Link></div></div><div className="relative hidden min-h-[320px] items-end lg:flex"><div className="absolute right-10 top-4 h-64 w-64 rounded-full border-[30px] border-[#e9654d]/25" />{nextUp && <NextOnDeck event={nextUp} />}</div></div></section><section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20"><div className="mb-8 flex items-end justify-between"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">CURATED PICKS / 01</p><h2 className="mt-2 font-display text-4xl font-bold tracking-wide text-[#17364a]">本週值得關注</h2></div><Link href="/events" data-testid="link-home-all-events" className="hidden items-center gap-1 text-sm font-bold text-[#087f8c] md:flex">查看全部 <ChevronRight size={17} /></Link></div><div className="grid gap-5 md:grid-cols-2">{(featured.length ? featured : published.slice(0, 2)).map((event, i) => <EventFeatureCard key={event.id} event={event} sport={sports.find(s => s.name === event.sportName)} index={i} />)}</div></section><HomeListing events={published} settings={settings} /><section className="border-y border-[#ded5c8] bg-[#ebe4d7]"><div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-12 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">BROWSE BY SPORT</p><h2 className="mt-2 font-display text-4xl font-bold text-[#17364a]">照你的節奏<br />挑一場。</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{sports.slice(0, 8).map(s => <Link href={`/events?sport=${encodeURIComponent(s.name)}`} key={s.id} data-testid={`link-sport-${s.id}`} className="group flex min-h-24 flex-col justify-between rounded-xl border border-[#d6ccbd] bg-[#f8f4ec] p-4 transition hover:-translate-y-1 hover:border-[#087f8c]"><span className="h-2 w-8 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-sm font-bold text-[#354b55] group-hover:text-[#087f8c]">{s.name}</span><span className="font-mono-custom text-[10px] text-[#918d84]">{events.filter(e => e.sportName === s.name && e.reviewStatus === '已發布').length.toString().padStart(2, '0')} EVENTS</span></Link>)}</div></div></section><section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8"><div className="flex flex-col gap-7 rounded-2xl bg-[#ed7659] p-7 text-[#fff8ee] md:flex-row md:items-center md:justify-between md:p-10"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ffe2d6]">FOR ORGANIZERS</p><h2 className="mt-2 font-display text-4xl font-bold">有一場賽事要讓大家知道？</h2><p className="mt-2 text-sm text-[#ffe2d6]">提交活動資訊，讓更多選手準時到場。</p></div><Link href="/admin/events" data-testid="link-submit-event" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17364a] px-5 py-3 text-sm font-bold text-[#f8f4ec] hover:bg-[#0d5265]">前往賽事管理 <FilePlus2 size={17} /></Link></div></section></main>;
}

// Hero card: the nearest upcoming published event.
function NextOnDeck({ event }: { event: EventItem }) {
  const date = normalizeDate(event.startdate);
  return <Link href={`/events/${event.id}`} data-testid="card-next-on-deck" className="absolute bottom-3 right-0 w-72 rotate-[-7deg] border border-[#658287] bg-[#23495b] p-5 shadow-[12px_12px_0_#0d2837] transition hover:rotate-[-5deg]"><div className="flex items-center justify-between border-b border-[#55737a] pb-3 text-xs text-[#b7c9ca]"><span className="font-mono-custom">NEXT ON DECK</span><span className="text-[#f07b60]">01</span></div><p className="mt-5 line-clamp-3 font-display text-4xl font-bold leading-none">{event.name}</p><div className="mt-7 flex justify-between gap-3 text-xs text-[#c6d3d2]"><span className="shrink-0">{date.slice(5).replace('-', '.')} / {weekdayEn(date)}</span><span className="truncate">{event.sportName}{event.location ? ` · ${event.location}` : ''}</span></div></Link>;
}

function sortEvents(list: EventItem[], sortBy: SortBy): EventItem[] {
  const arr = [...list];
  if (sortBy === '依運動項目') arr.sort((a, b) => a.sportName.localeCompare(b.sportName, 'zh-Hant') || a.startdate.localeCompare(b.startdate));
  else if (sortBy === '依狀態') { const order: Record<string, number> = { '報名中': 0, '即將報名': 1, '已截止': 2, '已結束': 3 }; arr.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.startdate.localeCompare(b.startdate)); }
  else arr.sort((a, b) => a.startdate.localeCompare(b.startdate));
  return arr;
}

function groupByMonth(list: EventItem[], pinFeatured: boolean): { month: string; events: EventItem[] }[] {
  const groups = new Map<string, EventItem[]>();
  for (const e of list) {
    const month = e.startdate.slice(0, 7) || '未定';
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(e);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, evs]) => ({
    month,
    events: pinFeatured ? [...evs].sort((a, b) => Number(b.important) - Number(a.important)) : evs,
  }));
}

function HomeListing({ events, settings }: { events: EventItem[]; settings: SiteSettings }) {
  const grouped = useMemo(() => groupByMonth(sortEvents(events, settings.sortBy), settings.pinFeatured), [events, settings.sortBy, settings.pinFeatured]);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const report = async (event: EventItem) => {
    try {
      await fetch(`/api/events/${event.id.replace(/^e/, '')}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventName: event.name }) });
    } catch {
      // best-effort only; still mark as reported locally so the guest gets feedback
    }
    setReported(prev => new Set(prev).add(event.id));
  };
  return <section className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8 lg:py-20" data-testid="section-home-listing"><div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">EVENT CALENDAR</p><h2 className="mt-2 font-display text-4xl font-bold tracking-wide text-[#17364a]">近期賽事</h2></div><span data-testid="text-home-listing-mode" className="font-mono-custom text-[11px] text-[#8b8277]">{settings.viewMode} · {settings.sortBy}</span></div>{grouped.length === 0 && <EmptyState title="目前沒有符合條件的賽事" detail="調整「前台顯示控制」中的設定即可看到更多賽事。" />}{settings.viewMode === '行事曆' ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="view-home-calendar">{grouped.map(g => <div key={g.month} data-testid={`month-group-${g.month}`} className="rounded-2xl border border-[#d9cfc1] bg-[#f8f4ec] p-5"><p className="font-mono-custom text-xs font-bold text-[#087f8c]">{g.month}</p><div className="mt-3 space-y-3">{g.events.map(e => <HomeEventEntry key={e.id} event={e} settings={settings} reported={reported.has(e.id)} onReport={() => report(e)} />)}</div></div>)}</div> : <div className="space-y-8" data-testid="view-home-list">{grouped.map(g => <div key={g.month} data-testid={`month-group-${g.month}`}><p className="mb-3 font-mono-custom text-xs font-bold text-[#087f8c]">{g.month}</p><div className="grid gap-3">{g.events.map(e => <HomeEventEntry key={e.id} event={e} settings={settings} reported={reported.has(e.id)} onReport={() => report(e)} />)}</div></div>)}</div>}</section>;
}

function HomeEventEntry({ event, settings, reported, onReport }: { event: EventItem; settings: SiteSettings; reported: boolean; onReport: () => void }) {
  return <div data-testid={`row-home-event-${event.id}`} className="flex items-center gap-3 rounded-xl border border-[#ddd3c5] bg-[#f8f4ec] p-4"><Link href={`/events/${event.id}`} className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-bold text-[#087f8c]">{event.sportName}</span>{event.important && <span data-testid={`badge-important-${event.id}`} className="rounded-full bg-[#f9e7c3] px-2 py-0.5 text-[10px] font-bold text-[#9a6917]">重點</span>}<StatusBadge status={event.status} /></div><h3 className="mt-1 truncate text-sm font-bold text-[#273f4b]">{event.name}</h3><p className="mt-1 text-xs text-[#7b8584]">{event.startdate}</p></Link>{settings.allowGuestReport && (reported ? <span data-testid={`status-reported-${event.id}`} className="shrink-0 rounded-full bg-[#dceee8] px-3 py-1.5 text-[11px] font-bold text-[#237260]">已回報</span> : <button onClick={onReport} data-testid={`button-report-error-${event.id}`} className="shrink-0 rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-1.5 text-[11px] font-bold text-[#b14f3b] hover:border-[#b14f3b]">回報錯誤</button>)}</div>;
}

function EventFeatureCard({ event, sport, index }: { event: EventItem; sport?: Sport; index: number }) {
  return <Link href={`/events/${event.id}`} data-testid={`card-featured-event-${event.id}`} className={`group relative overflow-hidden rounded-2xl border border-[#d8cec1] bg-[#f8f4ec] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${index === 0 ? 'md:row-span-2 md:p-8' : ''}`}><div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full opacity-20" style={{ backgroundColor: sport?.color || '#087f8c' }} /><div className="relative flex h-full flex-col"><div className="flex items-center justify-between"><span className="rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: sport?.color || '#087f8c' }}>{event.sportName}</span><span className="font-mono-custom text-[11px] text-[#8b8277]">{event.startdate.replaceAll('-', '.')}</span></div><h3 className={`mt-7 max-w-md font-display font-bold leading-[.95] text-[#17364a] ${index === 0 ? 'text-5xl md:text-6xl' : 'text-4xl'}`}>{event.name}</h3><div className="mt-auto flex items-end justify-between pt-10"><span className="flex items-center gap-1.5 text-xs font-semibold text-[#68777b]"><MapPin size={14} className="text-[#ed7659]" />{event.location}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#17364a] text-white transition group-hover:bg-[#087f8c]"><ChevronRight size={17} /></span></div></div></Link>;
}
