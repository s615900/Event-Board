'use client';

import { useState } from 'react';
import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AdminHeader, Button, EmptyState, Field, Modal } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { ragicCreate, ragicDelete, ragicUpdate } from '@/lib/ragic-client';
import type { EventItem, EventStatus, ReviewStatus, Sport } from '@/lib/types';

export function AdminEvents() {
  const { events, setEvents, sports, notify: onNotice } = useData();
  const { user } = useAuth();
  const role = user?.role;
  const canWrite = role === '管理者' || role === '編輯者';
  const isAdmin = role === '管理者';
  const [term, setTerm] = useState(''); const [filter, setFilter] = useState('全部'); const [modal, setModal] = useState<EventItem | 'new' | null>(null);
  const list = events.filter(e => !term || e.name.includes(term) || e.location.includes(term)).filter(e => filter === '全部' || e.reviewStatus === filter);
  const remove = async (id: string) => {
    if (!window.confirm('確定要刪除這筆賽事嗎？')) return;
    const ok = await ragicDelete(`/api/events/${id.replace(/^e/, '')}`);
    if (!ok) { onNotice('刪除失敗，請稍後再試'); return; }
    setEvents(old => old.filter(e => e.id !== id));
    onNotice('賽事已刪除');
  };
  const save = async (event: EventItem) => {
    const payload = { name: event.name, sportName: event.sportName, startdate: event.startdate, enddate: event.enddate, status: event.status, level: event.level, location: event.location, note: event.note, important: event.important, reviewStatus: event.reviewStatus };
    if (event.id) {
      const ok = await ragicUpdate(`/api/events/${event.id.replace(/^e/, '')}`, payload);
      if (!ok) { onNotice('儲存失敗，請稍後再試'); return; }
      setEvents(old => old.map(e => e.id === event.id ? event : e));
    } else {
      const result = await ragicCreate('/api/events', payload);
      if (!result.ok) { onNotice('新增失敗，請稍後再試'); return; }
      setEvents(old => [{ ...event, id: `e${result.ragicId}` }, ...old]);
    }
    setModal(null);
    onNotice(event.reviewStatus === '已發布' ? '賽事已儲存並發布' : '賽事已儲存，等待審核');
  };
  const review = async (id: string, reviewStatus: ReviewStatus) => {
    const ok = await ragicUpdate(`/api/events/${id.replace(/^e/, '')}`, { reviewStatus });
    if (!ok) { onNotice('更新失敗，請稍後再試'); return; }
    setEvents(old => old.map(e => e.id === id ? { ...e, reviewStatus } : e));
    onNotice(reviewStatus === '已發布' ? '賽事已發布' : '已退回修正');
  };
  return <main className="page-enter"><AdminHeader eyebrow="CONTENT / EVENTS" title="賽事管理" detail={`共 ${events.length} 筆資料 · 本機示範資料`} action={canWrite ? <Button testId="button-new-event" onClick={() => setModal('new')}><Plus size={17} />新增賽事</Button> : undefined} /><div className="mt-7 flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-2 rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3"><Search size={17} className="text-[#788587]" /><input value={term} onChange={e => setTerm(e.target.value)} data-testid="input-admin-event-search" placeholder="搜尋賽事名稱或地點" className="w-full bg-transparent py-3 text-sm outline-none" /></div><select value={filter} onChange={e => setFilter(e.target.value)} data-testid="select-review-filter" className="rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-3 text-sm font-semibold outline-none"><option>全部</option><option>待審核</option><option>已發布</option><option>退回修正</option></select></div><div className="mt-5 overflow-hidden rounded-xl border border-[#d9cfc1] bg-[#f8f4ec]"><div className="hidden grid-cols-[1.4fr_.65fr_.8fr_.7fr_120px] gap-3 border-b border-[#e1d8cc] bg-[#ebe4d7] px-5 py-3 text-[10px] font-bold tracking-wider text-[#7a827e] md:grid"><span>賽事名稱</span><span>日期</span><span>運動</span><span>審核狀態</span><span>操作</span></div>{list.map(e => <div key={e.id} data-testid={`row-admin-event-${e.id}`} className="grid gap-3 border-b border-[#e8dfd4] px-5 py-4 last:border-0 md:grid-cols-[1.4fr_.65fr_.8fr_.7fr_120px] md:items-center"><div><p className="text-sm font-bold text-[#304a55]">{e.name}</p><p className="mt-1 text-xs text-[#8b8277]">{e.location}</p></div><span className="font-mono-custom text-xs text-[#596a6e]">{e.startdate.slice(5).replace('-', '/')}</span><span className="text-xs font-bold text-[#087f8c]">{e.sportName}</span><span className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold ${e.reviewStatus === '已發布' ? 'bg-[#dceee8] text-[#237260]' : e.reviewStatus === '待審核' ? 'bg-[#f9e7c3] text-[#9a6917]' : 'bg-[#f4ded6] text-[#a4523c]'}`}>{e.reviewStatus}</span><div className="flex gap-1">{canWrite && <button onClick={() => setModal(e)} data-testid={`button-edit-event-${e.id}`} className="rounded-lg p-2 text-[#53636a] hover:bg-[#ebe4d7]"><Pencil size={15} /></button>}{isAdmin && e.reviewStatus !== '已發布' && <button onClick={() => review(e.id, '已發布')} data-testid={`button-publish-event-${e.id}`} className="rounded-lg p-2 text-[#087f8c] hover:bg-[#dceee8]"><Check size={15} /></button>}{isAdmin && <button onClick={() => remove(e.id)} data-testid={`button-delete-event-${e.id}`} className="rounded-lg p-2 text-[#b9533e] hover:bg-[#f8e6df]"><Trash2 size={15} /></button>}</div></div>)}{list.length === 0 && <EmptyState title="沒有符合的賽事" detail="調整搜尋條件，或建立一筆新賽事。" onReset={() => { setTerm(''); setFilter('全部'); }} />}</div>{modal && canWrite && <EventModal initial={modal === 'new' ? null : modal} sports={sports} onClose={() => setModal(null)} onSave={save} isEditor={role === '編輯者'} />}</main>;
}

function EventModal({ initial, sports, onClose, onSave, isEditor }: { initial: EventItem | null; sports: Sport[]; onClose: () => void; onSave: (e: EventItem) => void; isEditor?: boolean }) {
  const [form, setForm] = useState<EventItem>(initial || { id: '', name: '', sportName: sports[0]?.name || '', startdate: '2025-10-18', enddate: '2025-10-18', status: '即將報名', level: '公開組', location: '', note: '', source: '賽事報資料小組', important: false, reviewStatus: '待審核', submitterName: '管理員', createdAt: '' });
  const set = (key: keyof EventItem, value: string | boolean) => setForm({ ...form, [key]: value } as EventItem);
  return <Modal title={initial ? '編輯賽事' : '新增賽事'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); if (form.name && form.location) onSave(form); }} className="space-y-4">{isEditor && <p data-testid="text-editor-review-note" className="rounded-lg bg-[#f9e7c3] px-3 py-2 text-xs font-semibold text-[#9a6917]">以編輯者身份送出，賽事會先進入「待審核」，需由管理者發布後才會公開。</p>}<Field label="賽事名稱" required><input value={form.name} onChange={e => set('name', e.target.value)} data-testid="input-form-event-name" required /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="運動種類"><select value={form.sportName} onChange={e => set('sportName', e.target.value)} data-testid="select-form-event-sport">{sports.map(s => <option key={s.id}>{s.name}</option>)}</select></Field><Field label="參賽級別"><input value={form.level} onChange={e => set('level', e.target.value)} data-testid="input-form-event-level" /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="開始日期"><input type="date" value={form.startdate} onChange={e => set('startdate', e.target.value)} data-testid="input-form-event-start" /></Field><Field label="結束日期"><input type="date" value={form.enddate} onChange={e => set('enddate', e.target.value)} data-testid="input-form-event-end" /></Field></div><Field label="地點" required><input value={form.location} onChange={e => set('location', e.target.value)} data-testid="input-form-event-location" required /></Field><Field label="賽事狀態"><select value={form.status} onChange={e => set('status', e.target.value as EventStatus)} data-testid="select-form-event-status"><option>即將報名</option><option>報名中</option><option>已截止</option><option>已結束</option></select></Field><Field label="備註"><textarea value={form.note} onChange={e => set('note', e.target.value)} data-testid="textarea-form-event-note" rows={3} /></Field><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.important} onChange={e => set('important', e.target.checked)} data-testid="checkbox-form-event-important" className="accent-[#ed7659]" />標記為首頁重點賽事</label><div className="flex justify-end gap-2 pt-3"><Button variant="quiet" onClick={onClose} testId="button-cancel-event">取消</Button><Button type="submit" testId="button-save-event">{initial ? '儲存變更' : '建立賽事'}</Button></div></form></Modal>;
}
