'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminHeader, Button, Field, Modal } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { ragicCreate, ragicDelete, ragicUpdate } from '@/lib/ragic-client';
import type { Source, Sport } from '@/lib/types';

export function AdminSports() {
  const { sports, setSports, sources, notify: onNotice } = useData();
  const { user } = useAuth();
  const canWrite = user?.role === '管理者' || user?.role === '編輯者';
  const isAdmin = user?.role === '管理者';
  const [modal, setModal] = useState<Sport | 'new' | null>(null);
  const save = async (sport: Sport) => {
    const payload = { name: sport.name, color: sport.color, group: sport.group, sourceName: sport.sourceName };
    if (sport.id) {
      const ok = await ragicUpdate(`/api/sports/${sport.id.replace(/^sp/, '')}`, payload);
      if (!ok) { onNotice('儲存失敗，請稍後再試'); return; }
      setSports(old => old.map(s => s.id === sport.id ? sport : s));
    } else {
      const result = await ragicCreate('/api/sports', payload);
      if (!result.ok) { onNotice('新增失敗，請稍後再試'); return; }
      setSports(old => [{ ...sport, id: `sp${result.ragicId}` }, ...old]);
    }
    setModal(null);
    onNotice('運動種類已儲存');
  };
  const remove = async (id: string) => {
    if (!window.confirm('確定刪除此運動種類嗎？')) return;
    const ok = await ragicDelete(`/api/sports/${id.replace(/^sp/, '')}`);
    if (!ok) { onNotice('刪除失敗，請稍後再試'); return; }
    setSports(old => old.filter(s => s.id !== id));
    onNotice('運動種類已刪除');
  };
  return <main className="page-enter"><AdminHeader eyebrow="TAXONOMY / SPORTS" title="運動種類" detail="設定公開頁的分類、色彩與對應來源。" action={canWrite ? <Button testId="button-new-sport" onClick={() => setModal('new')}><Plus size={17} />新增種類</Button> : undefined} /><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sports.map(s => <div key={s.id} data-testid={`card-sport-${s.id}`} className="group rounded-xl border border-[#d9cfc1] bg-[#f8f4ec] p-5 transition hover:-translate-y-1"><div className="flex items-start justify-between"><span className="h-3 w-12 rounded-full" style={{ backgroundColor: s.color }} /><div className="flex opacity-0 transition group-hover:opacity-100">{canWrite && <button onClick={() => setModal(s)} data-testid={`button-edit-sport-${s.id}`} className="rounded-lg p-2 text-[#53636a] hover:bg-[#ebe4d7]"><Pencil size={14} /></button>}{isAdmin && <button onClick={() => remove(s.id)} data-testid={`button-delete-sport-${s.id}`} className="rounded-lg p-2 text-[#b9533e] hover:bg-[#f8e6df]"><Trash2 size={14} /></button>}</div></div><h2 className="mt-6 font-display text-3xl font-bold text-[#17364a]">{s.name}</h2><div className="mt-2 flex justify-between text-xs text-[#7b8584]"><span>{s.group}</span><span>{s.sourceName}</span></div></div>)}</div>{modal && canWrite && <SportModal initial={modal === 'new' ? null : modal} sources={sources} onClose={() => setModal(null)} onSave={save} />}</main>;
}

function SportModal({ initial, sources, onClose, onSave }: { initial: Sport | null; sources: Source[]; onClose: () => void; onSave: (s: Sport) => void }) {
  const [form, setForm] = useState<Sport>(initial || { id: '', name: '', color: '#087F8C', group: '其他', sourceName: sources[0]?.name || '' });
  const set = (k: keyof Sport, v: string) => setForm({ ...form, [k]: v });
  return <Modal title={initial ? '編輯運動種類' : '新增運動種類'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4"><Field label="名稱" required><input value={form.name} onChange={e => set('name', e.target.value)} data-testid="input-form-sport-name" required /></Field><Field label="分類"><select value={form.group} onChange={e => set('group', e.target.value)} data-testid="select-form-sport-group"><option>陸上運動</option><option>技擊運動</option><option>球類運動</option><option>其他</option></select></Field><Field label="色彩"><div className="flex gap-2"><input type="color" value={form.color} onChange={e => set('color', e.target.value)} data-testid="input-form-sport-color" className="h-11 w-14 rounded border p-1" /><input value={form.color} onChange={e => set('color', e.target.value)} data-testid="input-form-sport-hex" /></div></Field><Field label="資料來源"><select value={form.sourceName} onChange={e => set('sourceName', e.target.value)} data-testid="select-form-sport-source">{sources.map(s => <option key={s.id}>{s.name}</option>)}</select></Field><div className="flex justify-end gap-2 pt-3"><Button variant="quiet" onClick={onClose} testId="button-cancel-sport">取消</Button><Button type="submit" testId="button-save-sport">儲存種類</Button></div></form></Modal>;
}
