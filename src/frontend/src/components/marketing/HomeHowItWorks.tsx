import { getTranslations } from 'next-intl/server';
import { Search, CreditCard, Sparkles } from 'lucide-react';

const STEPS = [
  { key: 'howStep1', icon: Search, num: 1 },
  { key: 'howStep2', icon: CreditCard, num: 2 },
  { key: 'howStep3', icon: Sparkles, num: 3 },
] as const;

export async function HomeHowItWorks() {
  const t = await getTranslations('home');

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-primary-light)' }}
          >
            {t('howEyebrow')}
          </p>
          <h2
            className="text-2xl md:text-[1.75rem] font-bold tracking-tight"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t('howTitle')}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-6">
          {STEPS.map(({ key, icon: Icon, num }) => (
            <div
              key={key}
              className="relative flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                    boxShadow: '0 6px 20px rgba(26, 74, 122, 0.2)',
                  }}
                >
                  {num}
                </div>
                <div
                  className="hidden md:flex w-10 h-10 rounded-xl items-center justify-center"
                  style={{ background: 'var(--color-surface-alt)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
              <h3
                className="text-base font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t(`${key}Title`)}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {t(`${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
