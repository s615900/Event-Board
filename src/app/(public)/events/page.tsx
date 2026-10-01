import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EventsPage } from '@/components/public/events-page';

export const metadata: Metadata = { title: '全部賽事 | 賽事看板' };

// EventsPage reads ?q= / ?sport= via useSearchParams, which needs a Suspense boundary.
export default function Page() {
  return <Suspense><EventsPage /></Suspense>;
}
