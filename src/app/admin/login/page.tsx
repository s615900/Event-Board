import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AdminLogin } from '@/components/admin/admin-login';

export const metadata: Metadata = { title: '登入 | 賽事看板管理後台' };

// AdminLogin reads ?error= via useSearchParams, which needs a Suspense boundary.
export default function Page() {
  return <Suspense><AdminLogin /></Suspense>;
}
