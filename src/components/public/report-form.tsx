'use client';

import { useState, type FormEvent } from 'react';
import { Check, Flag } from 'lucide-react';

const MAX_LENGTH = 500;

// Guest "回報錯誤" form on the event detail page.
export function ReportForm({ eventId }: { eventId: string }) {
  const [reason, setReason] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError('請簡單描述哪裡有錯'); setState('error'); return; }
    setState('sending');
    try {
      const res = await fetch(`/api/events/${eventId}/report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || '送出失敗，請稍後再試'); setState('error'); return;
      }
      setState('sent');
    } catch {
      setError('無法連線，請檢查網路後再試'); setState('error');
    }
  };

  if (state === 'sent') {
    return <div id="report" data-testid="text-report-sent" className="flex items-center gap-2 rounded-xl bg-[#dceee8] px-4 py-3 text-sm font-bold text-[#237260]"><Check size={16} />謝謝你的回報！我們會盡快確認並更新。</div>;
  }
  return <form id="report" onSubmit={submit} className="scroll-mt-24 rounded-xl border border-[#e2d6c8] bg-[#fbf8f2] p-4" data-testid="form-report">
    <p className="flex items-center gap-2 text-sm font-bold text-[#b14f3b]"><Flag size={15} />發現資訊有誤？</p>
    <p className="mt-1 text-xs text-[#8b8277]">例如日期、地點或組別不正確，告訴我們哪裡需要修正。</p>
    <textarea value={reason} onChange={e => { setReason(e.target.value.slice(0, MAX_LENGTH)); if (state === 'error') setState('idle'); }} rows={3} placeholder="請描述哪裡有錯，例如：比賽日期應該是 10/18" data-testid="textarea-report-reason" className="mt-3 w-full rounded-lg border border-[#d4c9ba] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#087f8c]" />
    <div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-[#b14f3b]">{state === 'error' ? error : ''}</span><span className="flex items-center gap-3"><span className="font-mono-custom text-[10px] text-[#8b8277]">{reason.length}/{MAX_LENGTH}</span><button type="submit" disabled={state === 'sending'} data-testid="button-report-submit" className="rounded-lg bg-[#17364a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d5265] disabled:opacity-60">{state === 'sending' ? '送出中…' : '送出回報'}</button></span></div>
  </form>;
}
