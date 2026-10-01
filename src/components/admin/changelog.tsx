'use client';

import { AdminHeader, EmptyState } from '@/components/ui';
import { useData } from '@/lib/data';

export function AdminChangelog() {
  const { changelog } = useData();
  return <main className="page-enter"><AdminHeader eyebrow="AUDIT / CHANGELOG" title="變更紀錄" detail={`最近 ${changelog.length} 筆操作紀錄，依時間新到舊排序`} /><div className="mt-7 overflow-hidden rounded-xl border border-[#d9cfc1] bg-[#f8f4ec]"><div className="hidden grid-cols-[150px_1fr_90px_100px_2fr] gap-3 border-b border-[#e1d8cc] bg-[#ebe4d7] px-5 py-3 text-[10px] font-bold tracking-wider text-[#7a827e] md:grid"><span>時間</span><span>操作者</span><span>動作</span><span>資料表</span><span>說明</span></div>{changelog.map(c => <div key={c.id} data-testid={`row-changelog-${c.id}`} className="grid gap-2 border-b border-[#e8dfd4] px-5 py-4 last:border-0 md:grid-cols-[150px_1fr_90px_100px_2fr] md:items-center"><span className="font-mono-custom text-xs text-[#596a6e]">{c.time}</span><span className="truncate text-xs text-[#53636a]">{c.actor}</span><span className="w-fit rounded-full bg-[#ebe4d7] px-2 py-1 text-[10px] font-bold text-[#596a6e]">{c.actionType}</span><span className="text-xs font-bold text-[#087f8c]">{c.table}</span><span className="text-sm text-[#304a55]">{c.note}</span></div>)}{changelog.length === 0 && <EmptyState title="還沒有任何變更紀錄" detail="當有人新增、編輯、刪除或執行審核動作時，紀錄會顯示在這裡。" />}</div></main>;
}
