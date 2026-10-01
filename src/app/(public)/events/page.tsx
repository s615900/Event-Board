import type { Metadata } from 'next';
import { EventsPage, type EventFilters } from '@/components/public/events-page';
import { taipeiToday } from '@/lib/dates';
import { getPublicData } from '@/server/queries';

export const metadata: Metadata = { title: '全部賽事 | 賽事看板' };

export default async function Page({ searchParams }: PageProps<'/events'>) {
  const [{ events, sports }, params] = await Promise.all([getPublicData(), searchParams]);
  const first = (key: string) => {
    const v = params[key];
    return (Array.isArray(v) ? v[0] : v) ?? '';
  };
  const initialFilters: EventFilters = {
    q: first('q'),
    level: first('level'),
    sport: first('sport'),
    county: first('county'),
    tier: first('tier'),
    status: first('status'),
    view: first('view') === 'calendar' ? 'calendar' : 'list',
  };
  return <EventsPage events={events} sports={sports} today={taipeiToday()} initialFilters={initialFilters} />;
}
