'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { CircleHelp, X, Zap } from 'lucide-react';
import type { EventStatus } from '@/lib/types';

export function Brand({ admin = false }: { admin?: boolean }) {
  return <Link href={admin ? '/admin' : '/'} data-testid="link-brand" className="flex items-center gap-3">
    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ed7659] text-[#fff8ee] shadow-[4px_4px_0_#0a7782]"><Zap size={21} fill="currentColor" /></span>
    <span><span className="block font-display text-[25px] font-bold leading-none tracking-wide">賽事<span className="text-[#ed7659]">報</span></span><span className="mt-1 block text-[10px] font-bold tracking-[.22em] text-[#8b8277]">{admin ? 'EVENT DESK / ADMIN' : 'TAIWAN SPORTS CALENDAR'}</span></span>
  </Link>;
}

export function StatusBadge({ status }: { status: EventStatus }) {
  const style = status === '進行中' ? 'bg-[#f9e0d8] text-[#b9533e]' : status === '即將舉行' ? 'bg-[#dceee8] text-[#237260]' : 'bg-[#e5e6e1] text-[#707773]';
  return <span data-testid={`status-event-${status}`} className={`rounded-full px-2 py-1 text-[10px] font-bold ${style}`}>{status}</span>;
}

export function InfoLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="flex gap-3 border-b border-[#d8cdbf] py-4 last:border-0"><span className="text-[#ed7659]">{icon}</span><div><p className="text-[11px] font-bold text-[#8b8277]">{label}</p><p className="mt-1 text-sm font-bold text-[#314b56]">{value}</p></div></div>;
}

export function AdminHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-5 border-b border-[#d9cfc1] pb-7 md:flex-row md:items-end md:justify-between"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">{eyebrow}</p><h1 className="mt-2 font-display text-5xl font-bold leading-none text-[#17364a]">{title}</h1><p className="mt-3 text-sm text-[#718083]">{detail}</p></div>{action}</div>;
}

export function Button({ children, onClick, variant = 'primary', testId, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'danger'; testId: string; type?: 'button' | 'submit' }) {
  const color = variant === 'primary' ? 'bg-[#ed7659] text-white hover:bg-[#d85d48]' : variant === 'danger' ? 'border border-[#e2b5a9] text-[#b14f3b] hover:bg-[#f8e6df]' : 'border border-[#d4c9ba] bg-[#f8f4ec] text-[#53636a] hover:border-[#087f8c]';
  return <button type={type} onClick={onClick} data-testid={testId} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${color}`}>{children}</button>;
}

export function Metric({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone: string }) {
  const bg: Record<string, string> = { teal: 'bg-[#dceee8] text-[#237260]', coral: 'bg-[#f9e0d8] text-[#b9533e]', gold: 'bg-[#f9e7c3] text-[#9a6917]', slate: 'bg-[#dde5e6] text-[#536b75]' };
  return <div data-testid={`metric-${label}`} className="rounded-xl border border-[#d9cfc1] bg-[#f8f4ec] p-5"><div className="flex items-center justify-between"><span className={`grid h-9 w-9 place-items-center rounded-lg ${bg[tone]}`}>{icon}</span><span className="font-mono-custom text-[10px] text-[#8b8277]">LIVE</span></div><p className="mt-5 text-xs font-bold text-[#7b8584]">{label}</p><p className="mt-1 font-display text-5xl font-bold text-[#17364a]">{value.toString().padStart(2, '0')}</p></div>;
}

export function ToggleRow({ label, detail, checked, canWrite, onToggle, testId }: { label: string; detail: string; checked: boolean; canWrite: boolean; onToggle: () => void; testId: string }) {
  return <div className="flex items-center justify-between py-5 first:pt-0"><div><p className="text-sm font-bold text-[#304a55]">{label}</p><p className="mt-1 text-xs text-[#8b8277]">{detail}</p></div>{canWrite ? <button onClick={onToggle} data-testid={`button-toggle-${testId}`} className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[#087f8c]' : 'bg-[#c6c8c0]'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? 'left-6' : 'left-1'}`} /></button> : <span data-testid={`status-${testId}-readonly`} className="shrink-0 rounded-full bg-[#ebe4d7] px-3 py-1 text-[10px] font-bold text-[#8b8277]">{checked ? '已啟用' : '已停用'}（唯讀）</span>}</div>;
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="block text-sm font-bold text-[#53636a]">{label}{required && <span className="ml-1 text-[#ed7659]">*</span>}<div className="field-controls mt-2">{children}</div></label>;
}

// Portaled to <body>: `.page-enter`'s transform animation makes <main> a stacking
// context, which would otherwise trap the overlay under the admin header/sidebar.
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-[#17364a]/55 p-4 backdrop-blur-sm"><div role="dialog" data-testid="modal-form" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#d9cfc1] bg-[#f8f4ec] p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="font-display text-3xl font-bold text-[#17364a]">{title}</h2><button onClick={onClose} data-testid="button-close-modal" className="rounded-lg p-2 text-[#718083] hover:bg-[#ebe4d7]"><X size={19} /></button></div>{children}</div></div>, document.body);
}

export function EmptyState({ title, detail, onReset }: { title: string; detail: string; onReset?: () => void }) {
  return <div data-testid="empty-state" className="my-5 rounded-xl border border-dashed border-[#cfc3b5] bg-[#eee8de] px-5 py-12 text-center"><CircleHelp size={27} className="mx-auto text-[#ed7659]" /><h3 className="mt-4 text-base font-bold text-[#53636a]">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8b8277]">{detail}</p>{onReset && <button onClick={onReset} data-testid="button-reset-filters" className="mt-5 text-xs font-bold text-[#087f8c] underline">清除篩選</button>}</div>;
}
