'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminHeader, Button, EmptyState, Field, Modal } from '@/components/ui';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { SPORT_GROUPS } from '@/lib/options';
import type { Source, Sport } from '@/lib/types';

export function AdminSports() {
  const { sports, sources, events, mutate } = useData();
  const { user } = useAuth();
  const canWrite = user?.role === '管理者' || user?.role === '編輯者';
  const isAdmin = user?.role === '管理者';
  const [modal, setModal] = useState<Sport | 'new' | null>(null);
  const save = async (sport: Sport) => {
    const payload = { name: sport.name, color: sport.color, group: sport.group, sourceId: sport.sourceId };
    const ok = await mutate(() => (sport.id ? api.put(`/api/sports/${sport.id}`, payload) : api.post('/api/sports', payload)), '運動種類已儲存');
    if (ok) setModal(null);
  };
  const remove = async (sport: Sport) => {
    if (!window.confirm(`確定刪除「${sport.name}」嗎？`)) return;
    await mutate(() => api.del(`/api/sports/${sport.id}`), '運動種類已刪除');
  };
  return <main className="page-enter"><AdminHeader eyebrow="TAXONOMY / SPORTS" title="運動種類" detail="設定公開頁的分類、色彩與對應來源。" action={canWrite ? <Button testId="button-new-sport" onClick={() => setModal('new')}><Plus size={17} />新增種類</Button> : undefined} />{sports.length === 0 && <EmptyState title="還沒有運動種類" detail="先建立運動種類（例如田徑、羽球），新增賽事時才能選擇。" />}<div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sports.map(s => <div key={s.id} data-testid={`card-sport-${s.id}`} className="group rounded-xl border border-[#d9cfc1] bg-[#f8f4ec] p-5 transition hover:-translate-y-1"><div className="flex items-start justify-between"><span className="h-3 w-12 rounded-full" style={{ backgroundColor: s.color }} /><div className="flex opacity-100 transition md:opacity-0 md:group-hover:opacity-100">{canWrite && <button onClick={() => setModal(s)} title="編輯" data-testid={`button-edit-sport-${s.id}`} className="rounded-lg p-2 text-[#53636a] hover:bg-[#ebe4d7]"><Pencil size={14} /></button>}{isAdmin && <button onClick={() => remove(s)} title="刪除" data-testid={`button-delete-sport-${s.id}`} className="rounded-lg p-2 text-[#b9533e] hover:bg-[#f8e6df]"><Trash2 size={14} /></button>}</div></div><h2 className="mt-6 font-display text-3xl font-bold text-[#17364a]">{s.name}</h2><div className="mt-2 flex justify-between gap-2 text-xs text-[#7b8584]"><span>{s.group} · {events.filter(e => e.sportId === s.id).length} 場賽事</span><span className="truncate">{s.sourceName}</span></div></div>)}</div>{modal && canWrite && <SportModal initial={modal === 'new' ? null : modal} sources={sources} onClose={() => setModal(null)} onSave={save} />}</main>;
}

function SportModal({ initial, sources, onClose, onSave }: { initial: Sport | null; sources: Source[]; onClose: () => void; onSave: (s: Sport) => void }) {
  const [form, setForm] = useState<Sport>(initial || { id: '', name: '', color: '#087F8C', group: '其他', sourceId: '', sourceName: '' });
  const set = (k: keyof Sport, v: string) => setForm({ ...form, [k]: v });
  return <Modal title={initial ? '編輯運動種類' : '新增運動種類'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4"><Field label="名稱" required><input value={form.name} onChange={e => set('name', e.target.value)} data-testid="input-form-sport-name" required /></Field><Field label="分類"><select value={form.group} onChange={e => set('group', e.target.value)} data-testid="select-form-sport-group">{SPORT_GROUPS.map(g => <option key={g}>{g}</option>)}</select></Field><Field label="色彩"><div className="flex gap-2"><input type="color" value={form.color} onChange={e => set('color', e.target.value)} data-testid="input-form-sport-color" className="h-11 w-14 rounded border p-1" /><input value={form.color} onChange={e => set('color', e.target.value)} data-testid="input-form-sport-hex" /></div></Field><Field label="資料來源"><select value={form.sourceId} onChange={e => set('sourceId', e.target.value)} data-testid="select-form-sport-source"><option value="">（未指定）</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><div className="flex justify-end gap-2 pt-3"><Button variant="quiet" onClick={onClose} testId="button-cancel-sport">取消</Button><Button type="submit" testId="button-save-sport">儲存種類</Button></div></form></Modal>;
}
