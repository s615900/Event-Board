import { PublicShell } from '@/components/public/public-shell';

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return <PublicShell>{children}</PublicShell>;
}
