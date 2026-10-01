'use client';

import { AdminHeader, Button, EmptyState } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { ragicUpdate } from '@/lib/ragic-client';
import type { ReviewStatus } from '@/lib/types';

export function AdminReview() {
  const { events, setEvents, notify: onNotice } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === '管理者';
  const pending = events.filter(e => e.reviewStatus === '待審核');
  const published = events.filter(e => e.reviewStatus === '已發布');
  const review = async (id: string, reviewStatus: ReviewStatus, successMessage: string) => {
    const ok = await ragicUpdate(`/api/events/${id.replace(/^e/, '')}`, { reviewStatus });
    if (!ok) { onNotice('更新失敗，請稍後再試'); return; }
    setEvents(old => old.map(e => e.id === id ? { ...e, reviewStatus } : e));
    onNotice(successMessage);
  };
  return <main className="page-enter"><AdminHeader eyebrow="WORKFLOW / REVIEW" title="審核流程" detail={`待審核 ${pending.length} 筆 · 已發布 ${published.length} 筆`} />
    <section className="mt-8"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">PENDING QUEUE</p><h2 className="mt-1 text-lg font-bold text-[#304a55]">待審核清單</h2></div>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#d9cfc1] bg-[#f8f4ec]">{pending.map(e => <div key={e.id} data-testid={`row-review-pending-${e.id}`} className="flex flex-col gap-3 border-b border-[#e8dfd4] px-5 py-4 last:border-0 sm:flex-row sm:items-center"><div className="flex-1"><p className="text-sm font-bold text-[#304a55]">{e.name}</p><p className="mt-1 text-xs text-[#8b8277]">{e.startdate}{e.submitterName ? ` · ${e.submitterName}` : ''}</p></div>{isAdmin && <div className="flex gap-2"><Button testId={`button-approve-${e.id}`} onClick={() => review(e.id, '已發布', '賽事已核准發布')}>核准發布</Button><Button variant="quiet" testId={`button-reject-${e.id}`} onClick={() => review(e.id, '退回修正', '已退回修正')}>退回</Button></div>}</div>)}{pending.length === 0 && <EmptyState title="佇列是空的" detail="目前沒有等待審核的賽事。" />}</div>
    </section>
    <section className="mt-10"><div><p className="font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">PUBLISHED</p><h2 className="mt-1 text-lg font-bold text-[#304a55]">已發布清單</h2></div>
      <div className="mt-4 overflow-hidden rounded-xl border border-[#d9cfc1] bg-[#f8f4ec]">{published.map(e => <div key={e.id} data-testid={`row-review-published-${e.id}`} className="flex flex-col gap-3 border-b border-[#e8dfd4] px-5 py-4 last:border-0 sm:flex-row sm:items-center"><div className="flex-1"><p className="text-sm font-bold text-[#304a55]">{e.name}</p><p className="mt-1 text-xs text-[#8b8277]">{e.startdate}{e.submitterName ? ` · ${e.submitterName}` : ''}</p></div>{isAdmin && <Button variant="quiet" testId={`button-unpublish-${e.id}`} onClick={() => review(e.id, '待審核', '已下架，退回待審核')}>下架/退回審核</Button>}</div>)}{published.length === 0 && <EmptyState title="目前沒有已發布的賽事" detail="核准待審核清單中的賽事即可發布。" />}</div>
    </section>
  </main>;
}
