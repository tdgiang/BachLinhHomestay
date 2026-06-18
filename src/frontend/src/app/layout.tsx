import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/shared/Providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Ba.Li Homestay",
    template: "%s — Ba.Li Homestay",
  },
  description: "Đặt phòng linh hoạt theo giờ & ngày tại chuỗi homestay Ba.Li",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "Ba.Li Homestay",
    locale: "vi_VN",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
  },
  keywords: [
    "homestay",
    "đặt phòng",
    "Đà Nẵng",
    "Hội An",
    "theo giờ",
    "theo ngày",
  ],
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png" }],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={notoSansKR.variable} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
