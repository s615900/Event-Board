import type { Metadata } from 'next';
import { headers } from 'next/headers';
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
  const { id } = await params;
  const [detail, h] = await Promise.all([getPublicEvent(id), headers()]);
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return <EventDetail detail={detail} today={taipeiToday()} pageUrl={`${proto}://${host}/events/${id}`} />;
}
