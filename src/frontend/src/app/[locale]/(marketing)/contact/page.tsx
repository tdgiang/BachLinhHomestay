import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Liên hệ' };

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        Liên hệ
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Hotline: 0931 708 256 | Email: admin@bachlinh.com.vn
      </p>
    </div>
  );
}
