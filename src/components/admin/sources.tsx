'use client';

import { useState } from 'react';
import { Database, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminHeader, Button, Field, Modal } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { ragicCreate, ragicDelete, ragicUpdate } from '@/lib/ragic-client';
import type { Source } from '@/lib/types';

export function AdminSources() {
  const { sources, setSources, notify: onNotice } = useData();
  const { user } = useAuth();
  const canWrite = user?.role === '管理者' || user?.role === '編輯者';
  const isAdmin = user?.role === '管理者';
  const [modal, setModal] = useState<Source | 'new' | null>(null);
  const save = async (source: Source) => {
    const payload = { name: source.name, url: source.url, announceurl: source.announceurl, format: source.format, difficulty: source.difficulty, note: source.note };
    if (source.id) {
      const ok = await ragicUpdate(`/api/sources/${source.id.replace(/^s/, '')}`, payload);
      if (!ok) { onNotice('儲存失敗，請稍後再試'); return; }
      setSources(old => old.map(s => s.id === source.id ? source : s));
    } else {
      const result = await ragicCreate('/api/sources', payload);
      if (!result.ok) { onNotice('新增失敗，請稍後再試'); return; }
      setSources(old => [{ ...source, id: `s${result.ragicId}` }, ...old]);
    }
    setModal(null);
    onNotice('資料來源已儲存');
  };
  const remove = async (id: string) => {
    if (!window.confirm('確定移除此資料來源嗎？')) return;
    const ok = await ragicDelete(`/api/sources/${id.replace(/^s/, '')}`);
    if (!ok) { onNotice('移除失敗，請稍後再試'); return; }
    setSources(old => old.filter(s => s.id !== id));
    onNotice('資料來源已移除');
  };
  return <main className="page-enter"><AdminHeader eyebrow="CONFIGURATION / SOURCES" title="資料來源" detail="管理賽事資料的公告來源與檢查狀態。" action={canWrite ? <Button testId="button-new-source" onClick={() => setModal('new')}><Plus size={17} />新增來源</Button> : undefined} /><div className="mt-7 grid gap-4 lg:grid-cols-2">{sources.map(s => <div key={s.id} data-testid={`card-source-${s.id}`} className="rounded-xl border border-[#d9cfc1] bg-[#f8f4ec] p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#dceee8] text-[#087f8c]"><Database size={18} /></span><div><h2 className="text-sm font-bold text-[#304a55]">{s.name}</h2><p className="mt-1 text-xs text-[#087f8c]">{s.format} · 難度 {s.difficulty}</p></div></div><div className="flex">{canWrite && <button onClick={() => setModal(s)} data-testid={`button-edit-source-${s.id}`} className="rounded-lg p-2 text-[#53636a] hover:bg-[#ebe4d7]"><Pencil size={15} /></button>}{isAdmin && <button onClick={() => remove(s.id)} data-testid={`button-delete-source-${s.id}`} className="rounded-lg p-2 text-[#b9533e] hover:bg-[#f8e6df]"><Trash2 size={15} /></button>}</div></div><p className="mt-5 text-xs leading-6 text-[#718083]">{s.note}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ddd2] pt-4 text-[10px] text-[#8b8277]"><span>最後檢查 <b className="font-mono-custom text-[#53636a]">{s.lastChecked}</b></span><a href={s.url} target="_blank" rel="noreferrer" data-testid={`link-source-url-${s.id}`} className="inline-flex items-center gap-1 font-bold text-[#087f8c]">開啟來源 <ExternalLink size={12} /></a></div></div>)}</div>{modal && canWrite && <SourceModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={save} />}</main>;
}

function SourceModal({ initial, onClose, onSave }: { initial: Source | null; onClose: () => void; onSave: (s: Source) => void }) {
  const [form, setForm] = useState<Source>(initial || { id: '', name: '', url: '', announceurl: '', format: 'HTML', difficulty: '中', note: '', lastChecked: '', lastFound: '' });
  const set = (k: keyof Source, v: string) => setForm({ ...form, [k]: v });
  return <Modal title={initial ? '編輯資料來源' : '新增資料來源'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4"><Field label="來源名稱" required><input value={form.name} onChange={e => set('name', e.target.value)} data-testid="input-form-source-name" required /></Field><Field label="網站網址" required><input type="url" value={form.url} onChange={e => set('url', e.target.value)} data-testid="input-form-source-url" required /></Field><Field label="公告網址"><input type="url" value={form.announceurl} onChange={e => set('announceurl', e.target.value)} data-testid="input-form-source-announce" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="格式"><select value={form.format} onChange={e => set('format', e.target.value)} data-testid="select-form-source-format"><option>HTML</option><option>PDF</option><option>JSON</option></select></Field><Field label="讀取難度"><select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} data-testid="select-form-source-difficulty"><option>低</option><option>中</option><option>高</option></select></Field></div><Field label="備註"><textarea value={form.note} onChange={e => set('note', e.target.value)} data-testid="textarea-form-source-note" rows={3} /></Field><div className="flex justify-end gap-2 pt-3"><Button variant="quiet" onClick={onClose} testId="button-cancel-source">取消</Button><Button type="submit" testId="button-save-source">儲存來源</Button></div></form></Modal>;
}
