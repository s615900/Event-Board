'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { AdminHeader, Button, EmptyState } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { ragicUpdate } from '@/lib/ragic-client';
import type { ReportStatus } from '@/lib/types';

export function AdminReports() {
  const { reports, setReports, notify: onNotice } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === '管理者';
  const [filter, setFilter] = useState<'全部' | ReportStatus>('未處理');
  const pendingCount = reports.filter(r => r.status === '未處理').length;
  const list = reports.filter(r => filter === '全部' || r.status === filter);
  const markProcessed = async (id: string) => {
    const ok = await ragicUpdate(`/api/reports/${id.replace(/^r/, '')}`, {});
    if (!ok) { onNotice('更新失敗，請稍後再試'); return; }
    setReports(old => old.map(r => r.id === id ? { ...r, status: '已處理' as ReportStatus, processedAt: new Date().toLocaleString('zh-TW'), processedBy: user?.email ?? '' } : r));
    onNotice('已標記為已處理');
  };
  return <main className="page-enter"><AdminHeader eyebrow="SUPPORT / REPORTS" title="錯誤回報" detail={`待處理 ${pendingCount} 筆 · 共 ${reports.length} 筆訪客回報`} /><div className="mt-7 flex gap-2"><select value={filter} onChange={e => setFilter(e.target.value as '全部' | ReportStatus)} data-testid="select-report-filter" className="rounded-lg border border-[#d4c9ba] bg-[#f8f4ec] px-3 py-3 text-sm font-semibold outline-none"><option>全部</option><option>未處理</option><option>已處理</option></select></div><div className="mt-5 overflow-hidden rounded-xl border border-[#d9cfc1] bg-[#f8f4ec]"><div className="hidden grid-cols-[140px_1fr_1.4fr_90px_180px] gap-3 border-b border-[#e1d8cc] bg-[#ebe4d7] px-5 py-3 text-[10px] font-bold tracking-wider text-[#7a827e] md:grid"><span>時間</span><span>賽事</span><span>回報內容</span><span>狀態</span><span>操作</span></div>{list.map(r => <div key={r.id} data-testid={`row-report-${r.id}`} className="grid gap-2 border-b border-[#e8dfd4] px-5 py-4 last:border-0 md:grid-cols-[140px_1fr_1.4fr_90px_180px] md:items-center"><span className="font-mono-custom text-xs text-[#596a6e]">{r.time}</span><span className="text-sm font-bold text-[#304a55]">{r.eventName || `賽事 #${r.eventId}`}</span><span className="text-sm text-[#56676b]">{r.content}</span><span className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold ${r.status === '已處理' ? 'bg-[#dceee8] text-[#237260]' : 'bg-[#f9e7c3] text-[#9a6917]'}`}>{r.status}</span>{r.status === '未處理' ? (isAdmin ? <Button testId={`button-resolve-report-${r.id}`} onClick={() => markProcessed(r.id)}><Check size={15} />標記已處理</Button> : <span className="text-xs text-[#8b8277]">需管理者處理</span>) : <span data-testid={`text-processed-by-${r.id}`} className="text-xs text-[#8b8277]">{r.processedBy} · {r.processedAt}</span>}</div>)}{list.length === 0 && <EmptyState title="目前沒有回報" detail="訪客在首頁點擊「回報錯誤」送出的紀錄會顯示在這裡。" />}</div></main>;
}
