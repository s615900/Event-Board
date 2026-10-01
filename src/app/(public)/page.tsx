import { Home } from '@/components/public/home';
import { taipeiToday } from '@/lib/dates';
import { getPublicData } from '@/server/queries';

export default async function HomePage() {
  const { events, sports, settings } = await getPublicData();
  return <Home events={events} sports={sports} settings={settings} today={taipeiToday()} />;
}
