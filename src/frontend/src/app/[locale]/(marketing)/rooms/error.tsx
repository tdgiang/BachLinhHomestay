'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function RoomsError({ reset }: { reset: () => void }) {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="text-center">
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {t('error')}
        </p>
        <div className="flex gap-3 justify-center mt-4">
          <Button variant="outline" onClick={reset}>{t('retry')}</Button>
          <Button render={<Link href="/" />} nativeButton={false} className="text-white" style={{ background: 'var(--color-primary)' }}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
