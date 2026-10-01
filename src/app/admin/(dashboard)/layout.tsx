import type { Metadata } from 'next';
import { AdminGate } from '@/components/admin/admin-shell';

export const metadata: Metadata = { title: '管理後台 | 賽事看板', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return <AdminGate>{children}</AdminGate>;
}
