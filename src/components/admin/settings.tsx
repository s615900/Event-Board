'use client';

import { useEffect, useState } from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';
import { AdminHeader, Button, Field, ToggleRow } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { ragicUpdate } from '@/lib/ragic-client';
import type { SiteSettings } from '@/lib/types';

export function AdminSettings() {
  const { settings, setSettings, notify: onNotice } = useData();
  const { user } = useAuth();
  const canWrite = user?.role === '管理者';
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form when settings arrive from the API
  useEffect(() => { setDraft(settings); }, [settings]);
  const set = (key: keyof SiteSettings, value: string | boolean) => { setDraft(old => ({ ...old, [key]: value } as SiteSettings)); setSaved(false); };
  const save = async () => {
    const ok = await ragicUpdate(`/api/settings/${settings.id.replace(/^st/, '')}`, { name: draft.name, showEnded: draft.showEnded, allowGuestReport: draft.allowGuestReport, pinFeatured: draft.pinFeatured, sortBy: draft.sortBy, viewMode: draft.viewMode });
    if (!ok) { onNotice('儲存失敗，請稍後再試'); return; }
    setSettings(draft);
    setSaved(true);
    onNotice('設定已儲存');
  };
  return <main className="page-enter"><AdminHeader eyebrow="SYSTEM / SETTINGS" title="前台顯示控制" detail="這些設定會直接影響公開首頁的預設顯示狀態。" /><div className="mt-7 grid max-w-3xl gap-5"><section className="rounded-2xl border border-[#d9cfc1] bg-[#f8f4ec] p-6"><div className="flex items-center gap-3"><SlidersHorizontal size={19} className="text-[#087f8c]" /><h2 className="text-lg font-bold text-[#304a55]">前台首頁行為</h2></div>{!canWrite && <p data-testid="text-settings-readonly-note" className="mt-4 rounded-lg bg-[#ebe4d7] px-3 py-2 text-xs font-semibold text-[#8b8277]">目前身份為 {user?.role}，僅能檢視，需管理者權限才能修改。</p>}<div className="mt-6 divide-y divide-[#e3d9cd]"><ToggleRow label="顯示已結束賽事" detail="關閉時，首頁預設不顯示已經過期的賽事。" checked={draft.showEnded} canWrite={canWrite} onToggle={() => set('showEnded', !draft.showEnded)} testId="showended" /><ToggleRow label="重點賽事置頂" detail="開啟時，標記重點的賽事會排在該月最上方。" checked={draft.pinFeatured} canWrite={canWrite} onToggle={() => set('pinFeatured', !draft.pinFeatured)} testId="pinfeatured" /><ToggleRow label="開放訪客回報錯誤" detail="開啟時，首頁每筆賽事旁會顯示「回報錯誤」按鈕。" checked={draft.allowGuestReport} canWrite={canWrite} onToggle={() => set('allowGuestReport', !draft.allowGuestReport)} testId="allowguestreport" /><div className="grid gap-4 py-5 sm:grid-cols-2"><Field label="預設排序方式"><select disabled={!canWrite} value={draft.sortBy} onChange={e => set('sortBy', e.target.value)} data-testid="select-settings-sortby"><option>依日期</option><option>依運動項目</option><option>依狀態</option></select></Field><Field label="預設檢視模式"><select disabled={!canWrite} value={draft.viewMode} onChange={e => set('viewMode', e.target.value)} data-testid="select-settings-viewmode"><option>條列</option><option>行事曆</option></select></Field></div></div></section>{canWrite && <Button testId="button-save-settings" onClick={save}>儲存設定 {saved && <Check size={15} />}</Button>}</div></main>;
}
