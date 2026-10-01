'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarDays, ChevronRight, ClipboardCheck, Database, ExternalLink, Flag, History, LayoutDashboard, LogOut, Menu, Settings, Trophy, Users, X } from 'lucide-react';
import { Brand } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export function AdminGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  useEffect(() => { if (status === 'anon') router.replace('/admin/login'); }, [status, router]);
  if (status === 'loading') {
    return <div data-testid="status-auth-loading" className="grid min-h-[100dvh] place-items-center bg-[#17364a] text-sm font-bold text-[#c7d4d3]">驗證登入中...</div>;
  }
  if (status !== 'authed') return null;
  return <AdminLayout>{children}</AdminLayout>;
}

const allNav = [
  { href: '/admin', label: '總覽', icon: LayoutDashboard, adminOnly: false },
  { href: '/admin/events', label: '賽事管理', icon: CalendarDays, adminOnly: false },
  { href: '/admin/review', label: '審核流程', icon: ClipboardCheck, adminOnly: false },
  { href: '/admin/sources', label: '資料來源', icon: Database, adminOnly: false },
  { href: '/admin/sports', label: '運動種類', icon: Trophy, adminOnly: false },
  { href: '/admin/members', label: '成員與權限', icon: Users, adminOnly: true },
  { href: '/admin/changelog', label: '變更紀錄', icon: History, adminOnly: false },
  { href: '/admin/reports', label: '錯誤回報', icon: Flag, adminOnly: false },
  { href: '/admin/settings', label: '系統設定', icon: Settings, adminOnly: false },
];

function AdminLayout({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const location = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role;
  const nav = allNav.filter(item => !item.adminOnly || role === '管理者');
  const handleLogout = async () => { await logout(); router.push('/admin/login'); };
  return <div className="min-h-[100dvh] bg-[#f4efe5] text-[#213746]"><aside className={`${menu ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-[#17364a] p-6 text-[#f8f4ec] transition-transform md:translate-x-0`}><Brand admin /><div className="mt-12 flex-1 space-y-1">{nav.map(item => { const Icon = item.icon; const active = location === item.href || (item.href !== '/admin' && location.startsWith(item.href)); return <Link href={item.href} key={item.href} onClick={() => setMenu(false)} data-testid={`link-admin-${item.label}`} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? 'bg-[#ed7659] text-white' : 'text-[#b9c8c8] hover:bg-[#23495b] hover:text-white'}`}><Icon size={18} />{item.label}{active && <ChevronRight size={15} className="ml-auto" />}</Link>; })}</div><div className="border-t border-[#355665] pt-5"><p className="font-mono-custom text-[10px] tracking-wider text-[#8da7aa]">CURRENT USER</p><p data-testid="text-current-user-name" className="mt-2 text-sm font-bold">{user?.name}</p><p data-testid="text-current-user-role" className="mt-1 text-xs text-[#8da7aa]">{user?.email} · {role}</p><button onClick={handleLogout} data-testid="button-logout" className="mt-4 flex w-full items-center gap-2 rounded-lg border border-[#355665] px-3 py-2 text-xs font-bold text-[#c7d4d3] transition hover:bg-[#23495b] hover:text-white"><LogOut size={14} />登出</button></div></aside>{menu && <div onClick={() => setMenu(false)} data-testid="overlay-admin-menu" className="fixed inset-0 z-20 md:hidden" />}<div className="md:pl-72"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#ddd3c5] bg-[#f8f4ec]/95 px-5 py-4 backdrop-blur md:px-9"><button onClick={() => setMenu(!menu)} data-testid="button-admin-menu" aria-label={menu ? '關閉選單' : '開啟選單'} aria-expanded={menu} className="rounded-lg p-2 md:hidden">{menu ? <X size={21} /> : <Menu size={21} />}</button><div className="hidden text-xs font-bold text-[#8b8277] md:block">資料管理 / <span className="text-[#087f8c]">{role}</span></div><Link href="/" data-testid="link-view-public" className="ml-auto flex items-center gap-2 text-sm font-bold text-[#087f8c]">檢視公開頁 <ExternalLink size={15} /></Link></header><div className="p-5 md:p-9">{children}</div></div></div>;
}
