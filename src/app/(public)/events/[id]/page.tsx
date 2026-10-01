import type { Metadata } from 'next';
import { EventDetail } from '@/components/public/event-detail';
import { taipeiToday } from '@/lib/dates';
import { getPublicEvent } from '@/server/queries';

export async function generateMetadata({ params }: PageProps<'/events/[id]'>): Promise<Metadata> {
  const detail = await getPublicEvent((await params).id);
  if (!detail) return { title: '找不到賽事 | 賽事看板' };
  const { event } = detail;
  return {
    title: `${event.name} | 賽事看板`,
    description: [event.startDate, event.sportName, event.schoolLevels.join('、'), event.county, event.location].filter(Boolean).join(' · '),
  };
}

export default async function Page({ params }: PageProps<'/events/[id]'>) {
  const detail = await getPublicEvent((await params).id);
  return <EventDetail detail={detail} today={taipeiToday()} />;
}
