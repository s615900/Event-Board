import { PublicShell } from '@/components/public/public-shell';
import { getPublishedEventCount } from '@/server/queries';

export default async function PublicLayout({ children }: LayoutProps<'/'>) {
  const publishedCount = await getPublishedEventCount();
  return <PublicShell publishedCount={publishedCount}>{children}</PublicShell>;
}
