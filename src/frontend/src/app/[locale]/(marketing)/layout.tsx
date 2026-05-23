import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Ocean Blue Homestay',
    template: '%s — Ocean Blue Homestay',
  },
  description: 'Đặt phòng linh hoạt theo giờ & ngày tại chuỗi homestay Ocean Blue.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
