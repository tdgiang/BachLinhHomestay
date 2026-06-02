import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function HomeCtaSection() {
  const t = await getTranslations('home');

  return (
    <section className="py-14 md:py-16 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12 text-center sm:text-left"
          style={{
            background:
              'linear-gradient(128deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, #3a7ab5 100%)',
            boxShadow: 'var(--shadow-hover)',
          }}
        >
          <div
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
            aria-hidden
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div className="max-w-lg mx-auto sm:mx-0">
              <h2 className="text-2xl sm:text-[1.65rem] font-bold text-white mb-3 tracking-tight leading-snug">
                {t('ctaTitle')}
              </h2>
              <p className="text-[15px] text-white/88 leading-relaxed">
                {t('ctaSubtitle')}
              </p>
            </div>

            <div className="flex flex-col xs:flex-row gap-3 justify-center sm:justify-end shrink-0">
              <Button
                render={<Link href="/#rooms" />}
                nativeButton={false}
                size="lg"
                className="rounded-xl font-semibold gap-2 h-11 px-6 bg-white hover:bg-white/95 border-0 cursor-pointer shadow-md"
                style={{ color: 'var(--color-primary-dark)' }}
              >
                {t('ctaPrimary')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                render={<Link href="/contact" />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="rounded-xl font-semibold gap-2 h-11 px-6 border-white/35 text-white bg-white/10 hover:bg-white/20 hover:text-white cursor-pointer backdrop-blur-sm"
              >
                <MessageCircle className="w-4 h-4" />
                {t('ctaSecondary')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
