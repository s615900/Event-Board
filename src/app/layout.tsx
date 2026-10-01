import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Noto_Sans_TC, Space_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { DataProvider } from '@/lib/data';
import './globals.css';

// CJK fonts are split into many unicode-range files, so skip preloading them.
const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  weight: ['400', '500', '600', '700', '800', '900'],
  preload: false,
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  weight: ['500', '600', '700', '800'],
  subsets: ['latin'],
});

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '賽事看板',
  description: '繁體中文賽事資訊平台：公開賽事瀏覽與搜尋，以及賽事、運動項目、資料來源與成員的管理後台。',
  robots: { index: true, follow: true },
  openGraph: { title: '賽事看板', type: 'website' },
  twitter: { card: 'summary_large_image', title: '賽事看板' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-Hant-TW" className={`${notoSansTC.variable} ${barlowCondensed.variable} ${spaceMono.variable}`}>
      <body>
        <AuthProvider>
          <DataProvider>
            <div className="noise app-shell">{children}</div>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
