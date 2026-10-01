'use client';

import { useState } from 'react';
import { Database, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminHeader, Button, EmptyState, Field, Modal } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { DIFFICULTIES, SOURCE_FORMATS } from '@/lib/options';
import { safeHttpUrl } from '@/lib/url';
import type { Source } from '@/lib/types';

const EMPTY_SOURCE: Source = { id: '', name: '', url: '', announceUrl: '', format: 'HTML', difficulty: '中', note: '', lastChecked: '', lastFound: '' };

export function AdminSources() {
  const { sources, mutate } = useData();
  const { user } = useAuth();
  const canWrite = user?.role === '管理者' || user?.role === '編輯者';
  const isAdmin = user?.role === '管理者';
  const [modal, setModal] = useState<Source | 'new' | null>(null);
  const save = async (source: Source) => {
    const { id, ...payload } = source;
    const ok = await mutate(() => (id ? api.put(`/api/sources/${id}`, payload) : api.post('/api/sources', payload)), '資料來源已儲存');
    if (ok) setModal(null);
  };
  const remove = async (source: Source) => {
    if (!window.confirm(`確定移除「${source.name}」嗎？`)) return;
    await mutate(() => api.del(`/api/sources/${source.id}`), '資料來源已移除');
  };
  return <main className="page-enter"><AdminHeader eyebrow="CONFIGURATION / SOURCES" title="資料來源" detail="管理賽事資料的公告來源與檢查狀態。" action={canWrite ? <Button testId="button-new-source" onClick={() => setModal('new')}><Plus size={17} />新增來源</Button> : undefined} />{sources.length === 0 && <EmptyState title="還沒有資料來源" detail="新增協會或教育單位的網站，方便追蹤賽事公告。" />}<div className="mt-7 grid gap-4 lg:grid-cols-2">{sources.map(s => <div key={s.id} data-testid={`card-source-${s.id}`} className="rounded-xl border border-[#d9cfc1] bg-[#f8f4ec] p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#dceee8] text-[#087f8c]"><Database size={18} /></span><div><h2 className="text-sm font-bold text-[#304a55]">{s.name}</h2><p className="mt-1 text-xs text-[#087f8c]">{s.format} · 難度 {s.difficulty}</p></div></div><div className="flex">{canWrite && <button onClick={() => setModal(s)} title="編輯" data-testid={`button-edit-source-${s.id}`} className="rounded-lg p-2 text-[#53636a] hover:bg-[#ebe4d7]"><Pencil size={15} /></button>}{isAdmin && <button onClick={() => remove(s)} title="刪除" data-testid={`button-delete-source-${s.id}`} className="rounded-lg p-2 text-[#b9533e] hover:bg-[#f8e6df]"><Trash2 size={15} /></button>}</div></div>{s.note && <p className="mt-5 text-xs leading-6 text-[#718083]">{s.note}</p>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ddd2] pt-4 text-[10px] text-[#8b8277]"><span>上次查詢 <b className="font-mono-custom text-[#53636a]">{s.lastChecked || '尚未查詢'}</b></span><span className="flex gap-3">{safeHttpUrl(s.announceUrl) && <a href={safeHttpUrl(s.announceUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-[#087f8c]">公告頁 <ExternalLink size={12} /></a>}{safeHttpUrl(s.url) && <a href={safeHttpUrl(s.url)} target="_blank" rel="noopener noreferrer" data-testid={`link-source-url-${s.id}`} className="inline-flex items-center gap-1 font-bold text-[#087f8c]">官網 <ExternalLink size={12} /></a>}</span></div></div>)}</div>{modal && canWrite && <SourceModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={save} />}</main>;
}

function SourceModal({ initial, onClose, onSave }: { initial: Source | null; onClose: () => void; onSave: (s: Source) => void }) {
  const [form, setForm] = useState<Source>(initial || EMPTY_SOURCE);
  const set = (k: keyof Source, v: string) => setForm({ ...form, [k]: v });
  return <Modal title={initial ? '編輯資料來源' : '新增資料來源'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4"><Field label="來源名稱" required><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="例：中華民國田徑協會" data-testid="input-form-source-name" required /></Field><Field label="官網網址"><input type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://" data-testid="input-form-source-url" /></Field><Field label="賽事公告頁網址"><input type="url" value={form.announceUrl} onChange={e => set('announceUrl', e.target.value)} placeholder="https://" data-testid="input-form-source-announce" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="資料格式"><select value={form.format} onChange={e => set('format', e.target.value)} data-testid="select-form-source-format">{SOURCE_FORMATS.map(f => <option key={f}>{f}</option>)}</select></Field><Field label="查詢難易度"><select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} data-testid="select-form-source-difficulty">{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="上次查詢日期"><input type="date" value={form.lastChecked} onChange={e => set('lastChecked', e.target.value)} data-testid="input-form-source-checked" /></Field><Field label="上次查到新資料"><input type="date" value={form.lastFound} onChange={e => set('lastFound', e.target.value)} data-testid="input-form-source-found" /></Field></div><Field label="備註"><textarea value={form.note} onChange={e => set('note', e.target.value)} data-testid="textarea-form-source-note" rows={3} /></Field><div className="flex justify-end gap-2 pt-3"><Button variant="quiet" onClick={onClose} testId="button-cancel-source">取消</Button><Button type="submit" testId="button-save-source">儲存來源</Button></div></form></Modal>;
}
