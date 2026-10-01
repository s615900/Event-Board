import type { Metadata } from 'next';
import { EventsPage } from '@/components/public/events-page';
import { taipeiToday } from '@/lib/dates';
import { getPublicData } from '@/server/queries';

export const metadata: Metadata = { title: '全部賽事 | 賽事看板' };

export default async function Page({ searchParams }: PageProps<'/events'>) {
  const [{ events, sports }, params] = await Promise.all([getPublicData(), searchParams]);
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  return <EventsPage events={events} sports={sports} today={taipeiToday()} initialQuery={first(params.q)} initialSport={first(params.sport)} />;
}
