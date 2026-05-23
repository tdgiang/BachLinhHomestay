import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { Providers } from '@/components/shared/Providers';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'Ocean Blue Homestay',
    template: '%s — Ocean Blue Homestay',
  },
  description: 'Đặt phòng linh hoạt theo giờ & ngày tại chuỗi homestay Ocean Blue — Đà Nẵng, Hội An.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type:        'website',
    siteName:    'Ocean Blue Homestay',
    locale:      'vi_VN',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  keywords: ['homestay', 'đặt phòng', 'Đà Nẵng', 'Hội An', 'theo giờ', 'theo ngày'],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={notoSansKR.variable} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
