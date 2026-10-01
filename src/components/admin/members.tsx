'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminHeader, Button, EmptyState, Field, Modal } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { ragicCreate, ragicDelete, ragicUpdate } from '@/lib/ragic-client';
import type { Member } from '@/lib/types';

export function AdminMembers() {
  const { members, setMembers, notify: onNotice } = useData();
  const { user } = useAuth();
  const [modal, setModal] = useState<Member | 'new' | null>(null);
  if (user?.role !== '管理者') {
    return <main className="page-enter"><AdminHeader eyebrow="ACCESS / MEMBERS" title="成員與權限" detail="僅管理者可以存取此頁面。" /><EmptyState title="權限不足" detail="請聯繫管理者取得存取權限。" /></main>;
  }
  const save = async (member: Member) => {
    const payload = { name: member.name, email: member.email, role: member.role, status: member.status };
    if (member.id) {
      const ok = await ragicUpdate(`/api/members/${member.id.replace(/^m/, '')}`, payload);
      if (!ok) { onNotice('儲存失敗，請稍後再試'); return; }
      setMembers(old => old.map(m => m.id === member.id ? member : m));
    } else {
      const result = await ragicCreate('/api/members', payload);
      if (!result.ok) { onNotice('新增失敗，請稍後再試'); return; }
      setMembers(old => [{ ...member, id: `m${result.ragicId}` }, ...old]);
    }
    setModal(null);
    onNotice('成員資料已儲存');
  };
  const remove = async (id: string) => {
    if (!window.confirm('確定移除此成員嗎？')) return;
    const ok = await ragicDelete(`/api/members/${id.replace(/^m/, '')}`);
    if (!ok) { onNotice('移除失敗，請稍後再試'); return; }
    setMembers(old => old.filter(m => m.id !== id));
    onNotice('成員已移除');
  };
  return <main className="page-enter"><AdminHeader eyebrow="ACCESS / MEMBERS" title="成員與權限" detail="管理資料桌的協作者與審核權限。" action={<Button testId="button-new-member" onClick={() => setModal('new')}><Plus size={17} />新增成員</Button>} /><div className="mt-7 overflow-hidden rounded-xl border border-[#d9cfc1] bg-[#f8f4ec]">{members.map(m => <div key={m.id} data-testid={`row-member-${m.id}`} className="flex flex-col gap-4 border-b border-[#e8dfd4] px-5 py-5 last:border-0 sm:flex-row sm:items-center"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dceee8] font-display text-xl font-bold text-[#087f8c]">{m.name.slice(0, 1)}</div><div className="flex-1"><p className="text-sm font-bold text-[#304a55]">{m.name}</p><p className="mt-1 text-xs text-[#8b8277]">{m.email}</p></div><span className="w-fit rounded-full bg-[#ebe4d7] px-3 py-1 text-xs font-bold text-[#596a6e]">{m.role}</span><span className="flex items-center gap-1.5 text-xs font-bold text-[#237260]"><span className="h-2 w-2 rounded-full bg-[#49a17e]" />{m.status}</span><div className="flex"><button onClick={() => setModal(m)} data-testid={`button-edit-member-${m.id}`} className="rounded-lg p-2 text-[#53636a] hover:bg-[#ebe4d7]"><Pencil size={15} /></button><button onClick={() => remove(m.id)} data-testid={`button-delete-member-${m.id}`} className="rounded-lg p-2 text-[#b9533e] hover:bg-[#f8e6df]"><Trash2 size={15} /></button></div></div>)}{!members.length && <EmptyState title="還沒有成員" detail="新增第一位協作者開始整理資料。" />}</div>{modal && <MemberModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={save} />}</main>;
}

function MemberModal({ initial, onClose, onSave }: { initial: Member | null; onClose: () => void; onSave: (m: Member) => void }) {
  const [form, setForm] = useState<Member>(initial || { id: '', name: '', email: '', role: '編輯者', status: '啟用' });
  const set = (k: keyof Member, v: string) => setForm({ ...form, [k]: v });
  return <Modal title={initial ? '編輯成員' : '新增成員'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4"><Field label="姓名" required><input value={form.name} onChange={e => set('name', e.target.value)} data-testid="input-form-member-name" required /></Field><Field label="電子信箱" required><input type="email" value={form.email} onChange={e => set('email', e.target.value)} data-testid="input-form-member-email" required /></Field><Field label="角色"><select value={form.role} onChange={e => set('role', e.target.value)} data-testid="select-form-member-role"><option>管理者</option><option>編輯者</option><option>檢視者</option></select></Field><Field label="狀態"><select value={form.status} onChange={e => set('status', e.target.value)} data-testid="select-form-member-status"><option>啟用</option><option>停用</option></select></Field><div className="flex justify-end gap-2 pt-3"><Button variant="quiet" onClick={onClose} testId="button-cancel-member">取消</Button><Button type="submit" testId="button-save-member">儲存成員</Button></div></form></Modal>;
}
