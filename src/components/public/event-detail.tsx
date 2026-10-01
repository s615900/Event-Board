'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, ClipboardCheck, ExternalLink, MapPin, Trophy } from 'lucide-react';
import { EmptyState, InfoLine, StatusBadge } from '@/components/ui';
import { useData } from '@/lib/data';
import { safeHttpUrl } from '@/lib/url';

export function EventDetail({ id }: { id: string }) {
  const { events, sources } = useData();
  // Unpublished events (待審核 / 退回修正) must not be reachable from the public site by URL.
  const event = events.find(e => e.id === id && e.reviewStatus === '已發布');
  const sourceUrl = safeHttpUrl(event ? sources.find(s => s.name === event.source)?.url : undefined);
  if (!event) return <main className="mx-auto max-w-2xl px-5 py-24"><EmptyState title="這場賽事不存在" detail="可能已被移除，或連結已經過期。" /></main>;
  return <main className="page-enter mx-auto max-w-[1000px] px-5 py-10 lg:px-8 lg:py-16"><Link href="/events" data-testid="link-back-events" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#087f8c]"><ChevronRight size={16} className="rotate-180" />回到賽事列表</Link><div className="overflow-hidden rounded-2xl border border-[#d9cfc1] bg-[#f8f4ec] shadow-sm"><div className="relative bg-[#17364a] p-7 text-[#f8f4ec] md:p-12"><div className="stripe absolute inset-0" /><div className="relative"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#ed7659] px-3 py-1 text-xs font-bold">{event.sportName}</span><StatusBadge status={event.status} /></div><h1 data-testid={`text-detail-name-${event.id}`} className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[.95] md:text-7xl">{event.name}</h1><p className="mt-6 flex items-center gap-2 text-sm text-[#c7d4d3]"><MapPin size={16} className="text-[#ed7659]" />{event.location}</p></div></div><div className="grid gap-8 p-7 md:grid-cols-[1.15fr_.85fr] md:p-12"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">ABOUT THIS EVENT</p><p className="mt-4 text-base leading-8 text-[#56676b]">{event.note}</p><div className="mt-8 border-t border-[#ded5c8] pt-6"><p className="text-xs font-bold text-[#8b8277]">主辦資訊來源</p>{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" data-testid="link-event-source" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#087f8c]">{event.source}<ExternalLink size={14} /></a> : <p data-testid="text-event-source" className="mt-2 text-sm font-bold text-[#56676b]">{event.source || '—'}</p>}<p className="mt-5 text-xs leading-6 text-[#8b8277]">資訊由賽事報資料小組整理，報名規則與最新異動請以主辦單位公告為準。</p></div></div><div className="h-fit rounded-xl bg-[#ebe4d7] p-5"><InfoLine icon={<CalendarDays size={17} />} label="比賽日期" value={event.startdate === event.enddate ? event.startdate : `${event.startdate} — ${event.enddate}`} /><InfoLine icon={<Trophy size={17} />} label="參賽級別" value={event.level} /><InfoLine icon={<ClipboardCheck size={17} />} label="資料狀態" value="已由賽事報審核發布" /></div></div></div></main>;
}
