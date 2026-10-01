import { EventDetail } from '@/components/public/event-detail';

export default async function Page({ params }: PageProps<'/events/[id]'>) {
  const { id } = await params;
  return <EventDetail id={id} />;
}
