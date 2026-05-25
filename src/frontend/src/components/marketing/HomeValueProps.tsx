import { getTranslations } from 'next-intl/server';
import { Clock, CreditCard, MapPinned, HeartHandshake } from 'lucide-react';

const FEATURES = [
  { key: 'featureFlexible', icon: Clock },
  { key: 'featurePayment', icon: CreditCard },
  { key: 'featureLocation', icon: MapPinned },
  { key: 'featureSupport', icon: HeartHandshake },
] as const;

export async function HomeValueProps() {
  const t = await getTranslations('home');

  return (
    <section
      className="py-16 md:py-20 px-4"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-primary-light)' }}
          >
            {t('featuresEyebrow')}
          </p>
          <h2
            className="text-2xl md:text-[1.75rem] font-bold tracking-tight leading-snug"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t('featuresTitle')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FEATURES.map(({ key, icon: Icon }) => (
            <article
              key={key}
              className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(26,74,122,0.1) 0%, rgba(46,111,170,0.06) 100%)',
                }}
              >
                <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3
                className="text-[15px] font-bold mb-2 leading-snug"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t(`${key}Title`)}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {t(`${key}Desc`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
