'use client';

import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AdminHeader, Button, EmptyState, Field, Modal, StatusBadge } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { eventStatus } from '@/lib/dates';
import { COUNTIES, GENDERS, REVIEW_STATUSES, SCHOOL_LEVELS, TIERS } from '@/lib/options';
import type { EventItem, ReviewStatus, Sport } from '@/lib/types';

// Fields the admin form edits; the API derives everything else.
type EventForm = Pick<EventItem, 'name' | 'sportId' | 'startDate' | 'endDate' | 'schoolLevels' | 'ageGroup' | 'gender' | 'tier' | 'county' | 'location' | 'note' | 'officialUrl' | 'qualifiesForId' | 'important' | 'reviewStatus'>;

function toForm(e: EventItem): EventForm {
  const { name, sportId, startDate, endDate, schoolLevels, ageGroup, gender, tier, county, location, note, officialUrl, qualifiesForId, important, reviewStatus } = e;
  return { name, sportId, startDate, endDate, schoolLevels, ageGroup, gender, tier, county, location, note, officialUrl, qualifiesForId, important, reviewStatus };
}

// Fields worth flagging when empty, so staff can find and fill gaps.
const MISSING_CHECKS: { key: string; label: string; test: (e: EventItem) => boolean }[] = [
  { key: 'sport', label: '運動', test: e => !e.sportId },
  { key: 'level', label: '學制', test: e => e.schoolLevels.length === 0 },
  { key: 'county', label: '縣市', test: e => !e.county },
  { key: 'location', label: '地點', test: e => !e.location },
  { key: 'tier', label: '層級', test: e => !e.tier },
  { key: 'official', label: '官方連結', test: e => !e.officialUrl },
];

type SortKey = 'date-asc' | 'date-desc' | 'created-desc' | 'name';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'date-asc', label: '比賽日期（近 → 遠）' },
  { key: 'date-desc', label: '比賽日期（遠 → 近）' },
  { key: 'created-desc', label: '最新建立' },
  { key: 'name', label: '名稱' },
];

const EMPTY_FILTERS = { term: '', review: '', status: '', sport: '', level: '', county: '', tier: '', year: '', missing: '' };
type Filters = typeof EMPTY_FILTERS;

export function AdminEvents() {
  const { events, sports, today, mutate } = useData();
  const { user } = useAuth();
  const role = user?.role;
  const canWrite = role === '管理者' || role === '編輯者';
  const isAdmin = role === '管理者';
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('date-asc');
  const [modal, setModal] = useState<EventItem | 'new' | null>(null);
  const set = (key: keyof Filters, value: string) => setFilters(old => ({ ...old, [key]: value }));
  const activeCount = Object.values(filters).filter(Boolean).length;

  const years = useMemo(() => Array.from(new Set(events.map(e => e.startDate.slice(0, 4)).filter(Boolean))).sort(), [events]);
  const missingCounts = useMemo(() => Object.fromEntries(MISSING_CHECKS.map(c => [c.key, events.filter(c.test).length])), [events]);
  const list = useMemo(() => {
    const term = filters.term.trim().toLowerCase();
    const missingCheck = MISSING_CHECKS.find(c => c.key === filters.missing);
    const filtered = events
      .filter(e => !term || `${e.name}${e.location}${e.county}${e.note}`.toLowerCase().includes(term))
      .filter(e => !filters.review || e.reviewStatus === filters.review)
      .filter(e => !filters.status || eventStatus(e, today) === filters.status)
      .filter(e => !filters.sport || (filters.sport === '__none' ? !e.sportId : e.sportId === filters.sport))
      .filter(e => !filters.level || e.schoolLevels.includes(filters.level))
      .filter(e => !filters.county || e.county === filters.county)
      .filter(e => !filters.tier || e.tier === filters.tier)
      .filter(e => !filters.year || e.startDate.startsWith(filters.year))
      .filter(e => !missingCheck || missingCheck.test(e));
    const sorted = [...filtered];
    if (sort === 'date-asc') sorted.sort((a, b) => a.startDate.localeCompare(b.startDate));
    else if (sort === 'date-desc') sorted.sort((a, b) => b.startDate.localeCompare(a.startDate));
    else if (sort === 'created-desc') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
    return sorted;
  }, [events, filters, sort, today]);

  const remove = async (event: EventItem) => {
    if (!window.confirm(`確定要刪除「${event.name}」嗎？`)) return;
    await mutate(() => api.del(`/api/events/${event.id}`), '賽事已刪除');
  };
  const save = async (form: EventForm, id?: string) => {
    const ok = await mutate(() => (id ? api.put(`/api/events/${id}`, form) : api.post('/api/events', form)), role === '編輯者' || form.reviewStatus !== '已發布' ? '賽事已儲存，等待審核' : '賽事已儲存並發布');
    if (ok) setModal(null);
  };
  const publish = (event: EventItem) => mutate(() => api.put(`/api/events/${event.id}`, { reviewStatus: '已發布' }), '賽事已發布');

  const selectClass = (active: boolean) => `w-full min-w-0 rounded-lg border px-3 py-2.5 text-sm font-semibold outline-none ${active ? 'border-[#087f8c] bg-[#e6f3f1] text-[#087f8c]' : 'border-[#d4c9ba] bg-[#f8f4ec] text-[#53636a]'}`;
  return <main className="page-enter"><AdminHeader eyebrow="CONTENT / EVENTS" title="賽事管理" detail={`共 ${events.length} 筆資料`} action={canWrite ? <Button testId="button-new-event" onClick={() => setModal('new')}><Plus size={17} />新增賽事</Button> : undefined} />

    <section className="mt-7 rounded-2xl border border-[#d9cfc1] bg-[#ebe4d7] p-4" aria-label="篩選">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3"><Search size={17} className="shrink-0 text-[#788587]" /><input value={filters.term} onChange={e => set('term', e.target.value)} data-testid="input-admin-event-search" placeholder="搜尋名稱、縣市、地點或備註" className="w-full bg-transparent py-2.5 text-sm outline-none" /></div>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)} aria-label="排序" data-testid="select-admin-event-sort" className="rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-2.5 text-sm font-semibold text-[#53636a] outline-none">{SORTS.map(o => <option key={o.key} value={o.key}>排序：{o.label}</option>)}</select>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        <select value={filters.review} onChange={e => set('review', e.target.value)} aria-label="審核狀態" data-testid="select-review-filter" className={selectClass(!!filters.review)}><option value="">全部審核狀態</option>{REVIEW_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        <select value={filters.status} onChange={e => set('status', e.target.value)} aria-label="賽事狀態" data-testid="select-admin-status" className={selectClass(!!filters.status)}><option value="">全部賽事狀態</option><option>即將舉行</option><option>進行中</option><option>已結束</option></select>
        <select value={filters.sport} onChange={e => set('sport', e.target.value)} aria-label="運動" data-testid="select-admin-sport" className={selectClass(!!filters.sport)}><option value="">全部運動</option>{sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}<option value="__none">（未指定運動）</option></select>
        <select value={filters.level} onChange={e => set('level', e.target.value)} aria-label="學制" data-testid="select-admin-level" className={selectClass(!!filters.level)}><option value="">全部學制</option>{SCHOOL_LEVELS.map(l => <option key={l}>{l}</option>)}</select>
        <select value={filters.county} onChange={e => set('county', e.target.value)} aria-label="縣市" data-testid="select-admin-county" className={selectClass(!!filters.county)}><option value="">全部縣市</option>{COUNTIES.map(c => <option key={c}>{c}</option>)}</select>
        <select value={filters.tier} onChange={e => set('tier', e.target.value)} aria-label="層級" data-testid="select-admin-tier" className={selectClass(!!filters.tier)}><option value="">全部層級</option>{TIERS.map(t => <option key={t} value={t}>{t}級</option>)}</select>
        <select value={filters.year} onChange={e => set('year', e.target.value)} aria-label="年份" data-testid="select-admin-year" className={selectClass(!!filters.year)}><option value="">全部年份</option>{years.map(y => <option key={y} value={y}>{y} 年</option>)}</select>
        <select value={filters.missing} onChange={e => set('missing', e.target.value)} aria-label="資料待補" data-testid="select-admin-missing" className={selectClass(!!filters.missing)}><option value="">資料完整度（全部）</option>{MISSING_CHECKS.map(c => <option key={c.key} value={c.key}>缺{c.label}（{missingCounts[c.key]}）</option>)}</select>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-[#53636a]" data-testid="text-admin-result-count">符合 {list.length} / {events.length} 筆</span>
        {activeCount > 0 && <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} data-testid="button-clear-admin-filters" className="font-bold text-[#087f8c] underline">清除 {activeCount} 個篩選條件</button>}
      </div>
    </section>

    <div className="mt-5 overflow-hidden rounded-xl border border-[#d9cfc1] bg-[#f8f4ec]"><div className="hidden grid-cols-[1.6fr_.75fr_.6fr_.6fr_.6fr_120px] gap-3 border-b border-[#e1d8cc] bg-[#ebe4d7] px-5 py-3 text-[10px] font-bold tracking-wider text-[#7a827e] md:grid"><span>賽事名稱</span><span>日期</span><span>運動</span><span>狀態</span><span>審核</span><span>操作</span></div>{list.map(e => {
      const missing = MISSING_CHECKS.filter(c => c.test(e));
      return <div key={e.id} data-testid={`row-admin-event-${e.id}`} className="grid gap-3 border-b border-[#e8dfd4] px-5 py-4 last:border-0 md:grid-cols-[1.6fr_.75fr_.6fr_.6fr_.6fr_120px] md:items-center"><div className="min-w-0"><p className="text-sm font-bold text-[#304a55]">{e.name}</p><p className="mt-1 text-xs text-[#8b8277]">{[e.schoolLevels.join('、'), e.tier && `${e.tier}級`, e.county, e.location].filter(Boolean).join(' · ') || '—'}</p>{missing.length > 0 && <p className="mt-1.5 flex flex-wrap gap-1" data-testid={`missing-${e.id}`}>{missing.map(c => <button key={c.key} type="button" onClick={() => set('missing', c.key)} title={`篩選所有缺${c.label}的賽事`} className="rounded bg-[#fbeee0] px-1.5 py-0.5 text-[10px] font-bold text-[#b07020] hover:bg-[#f6dcc0]">缺{c.label}</button>)}</p>}</div><span className="font-mono-custom text-xs text-[#596a6e]">{e.startDate}{e.endDate && e.endDate !== e.startDate ? <span className="block text-[#8b8277]">至 {e.endDate}</span> : null}</span><span className="text-xs font-bold text-[#087f8c]">{e.sportName || '—'}</span><span><StatusBadge status={eventStatus(e, today)} /></span><span className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold ${e.reviewStatus === '已發布' ? 'bg-[#dceee8] text-[#237260]' : e.reviewStatus === '待審核' ? 'bg-[#f9e7c3] text-[#9a6917]' : 'bg-[#f4ded6] text-[#a4523c]'}`}>{e.reviewStatus}</span><div className="flex gap-1">{canWrite && <button onClick={() => setModal(e)} title="編輯" data-testid={`button-edit-event-${e.id}`} className="rounded-lg p-2 text-[#53636a] hover:bg-[#ebe4d7]"><Pencil size={15} /></button>}{isAdmin && e.reviewStatus !== '已發布' && <button onClick={() => publish(e)} title="發布" data-testid={`button-publish-event-${e.id}`} className="rounded-lg p-2 text-[#087f8c] hover:bg-[#dceee8]"><Check size={15} /></button>}{isAdmin && <button onClick={() => remove(e)} title="刪除" data-testid={`button-delete-event-${e.id}`} className="rounded-lg p-2 text-[#b9533e] hover:bg-[#f8e6df]"><Trash2 size={15} /></button>}</div></div>;
    })}{list.length === 0 && <EmptyState title={events.length ? '沒有符合的賽事' : '還沒有任何賽事'} detail={events.length ? '調整篩選條件，或建立一筆新賽事。' : '按右上角「新增賽事」建立第一筆。'} onReset={events.length ? () => setFilters(EMPTY_FILTERS) : undefined} />}</div>{modal && canWrite && <EventModal initial={modal === 'new' ? null : modal} sports={sports} events={events} today={today} onClose={() => setModal(null)} onSave={save} isEditor={role === '編輯者'} />}</main>;
}

function EventModal({ initial, sports, events, today, onClose, onSave, isEditor }: { initial: EventItem | null; sports: Sport[]; events: EventItem[]; today: string; onClose: () => void; onSave: (form: EventForm, id?: string) => void; isEditor?: boolean }) {
  const [form, setForm] = useState<EventForm>(() => initial ? toForm(initial) : { name: '', sportId: sports[0]?.id ?? '', startDate: today, endDate: today, schoolLevels: [], ageGroup: '', gender: '', tier: '', county: '', location: '', note: '', officialUrl: '', qualifiesForId: '', important: false, reviewStatus: '待審核' });
  const set = <K extends keyof EventForm>(key: K, value: EventForm[K]) => setForm(old => ({ ...old, [key]: value }));
  const toggleLevel = (level: string) => set('schoolLevels', form.schoolLevels.includes(level) ? form.schoolLevels.filter(l => l !== level) : [...form.schoolLevels, level]);
  const otherEvents = events.filter(e => e.id !== initial?.id).sort((a, b) => b.startDate.localeCompare(a.startDate));
  return <Modal title={initial ? '編輯賽事' : '新增賽事'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(form, initial?.id); }} className="space-y-4">{isEditor && <p data-testid="text-editor-review-note" className="rounded-lg bg-[#f9e7c3] px-3 py-2 text-xs font-semibold text-[#9a6917]">以編輯者身份送出，賽事會先進入「待審核」，需由管理者發布後才會公開。</p>}<Field label="賽事名稱" required><input value={form.name} onChange={e => set('name', e.target.value)} data-testid="input-form-event-name" required /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="運動種類"><select value={form.sportId} onChange={e => set('sportId', e.target.value)} data-testid="select-form-event-sport"><option value="">（未指定）</option>{sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="賽事層級"><select value={form.tier} onChange={e => set('tier', e.target.value)} data-testid="select-form-event-tier"><option value="">（未指定）</option>{TIERS.map(t => <option key={t}>{t}</option>)}</select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="開始日期" required><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} data-testid="input-form-event-start" required /></Field><Field label="結束日期"><input type="date" value={form.endDate} min={form.startDate} onChange={e => set('endDate', e.target.value)} data-testid="input-form-event-end" /></Field></div><fieldset><legend className="text-sm font-bold text-[#53636a]">學制</legend><div className="mt-2 flex gap-4">{SCHOOL_LEVELS.map(level => <label key={level} className="flex items-center gap-2 text-sm font-semibold text-[#53636a]"><input type="checkbox" checked={form.schoolLevels.includes(level)} onChange={() => toggleLevel(level)} data-testid={`checkbox-form-event-level-${level}`} className="accent-[#087f8c]" />{level}</label>)}</div></fieldset><div className="grid gap-4 sm:grid-cols-2"><Field label="年齡組／年級"><input value={form.ageGroup} onChange={e => set('ageGroup', e.target.value)} placeholder="例：U12、國小高年級" data-testid="input-form-event-age" /></Field><Field label="性別"><select value={form.gender} onChange={e => set('gender', e.target.value)} data-testid="select-form-event-gender"><option value="">（未指定）</option>{GENDERS.map(g => <option key={g}>{g}</option>)}</select></Field></div><div className="grid gap-4 sm:grid-cols-[.8fr_1.2fr]"><Field label="縣市"><select value={form.county} onChange={e => set('county', e.target.value)} data-testid="select-form-event-county"><option value="">（未指定）</option>{COUNTIES.map(c => <option key={c}>{c}</option>)}</select></Field><Field label="地點"><input value={form.location} onChange={e => set('location', e.target.value)} placeholder="例：臺北田徑場" data-testid="input-form-event-location" /></Field></div><Field label="官方公告連結"><input type="url" value={form.officialUrl} onChange={e => set('officialUrl', e.target.value)} placeholder="https://" data-testid="input-form-event-official" /></Field><Field label="晉級至（選填）"><select value={form.qualifiesForId} onChange={e => set('qualifiesForId', e.target.value)} data-testid="select-form-event-qualifies"><option value="">（無）</option>{otherEvents.map(e => <option key={e.id} value={e.id}>{e.startDate}　{e.name}</option>)}</select></Field><Field label="備註"><textarea value={form.note} onChange={e => set('note', e.target.value)} data-testid="textarea-form-event-note" rows={3} /></Field>{!isEditor && <Field label="審核狀態"><select value={form.reviewStatus} onChange={e => set('reviewStatus', e.target.value as ReviewStatus)} data-testid="select-form-event-review">{REVIEW_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>}<label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.important} onChange={e => set('important', e.target.checked)} data-testid="checkbox-form-event-important" className="accent-[#ed7659]" />標記為首頁重點賽事</label><p className="text-xs text-[#8b8277]">賽事狀態（即將舉行／進行中／已結束）會依比賽日期自動判斷。</p><div className="flex justify-end gap-2 pt-3"><Button variant="quiet" onClick={onClose} testId="button-cancel-event">取消</Button><Button type="submit" testId="button-save-event">{initial ? '儲存變更' : '建立賽事'}</Button></div></form></Modal>;
}
