import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Về chúng tôi' };

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Về Ocean Blue Homestay
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Chuỗi homestay Ocean Blue với hơn 20 phòng tại 5+ chi nhánh ven biển miền Trung.
      </p>
    </div>
  );
}
