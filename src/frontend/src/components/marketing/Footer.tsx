import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Waves, Phone, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  const navLinks = [
    { label: tNav('findRoom'), href: '/rooms' },
    { label: tNav('about'), href: '/about' },
    { label: tNav('contact'), href: '/contact' },
  ];

  const branches = [
    { name: 'Đà Nẵng Trung Tâm', address: '12 Bạch Đằng, Hải Châu' },
    { name: 'Mỹ Khê', address: '58 Võ Nguyên Giáp, Ngũ Hành Sơn' },
    { name: 'Hội An', address: '45 Cửa Đại, Cẩm An' },
  ];

  return (
    <footer className="border-t" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                <Waves className="w-4 h-4 text-white" />
              </div>
              <span style={{ color: 'var(--color-text-primary)' }}>Ocean Blue Homestay</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {t('tagline')}
            </p>
            <div className="space-y-1.5">
              <a href="tel:02361234567" className="flex items-center gap-2 text-sm transition-colors hover:text-[--color-primary]" style={{ color: 'var(--color-text-secondary)' }}>
                <Phone className="w-3.5 h-3.5" /> 0236 123 4567
              </a>
              <a href="mailto:hello@oceanblue.vn" className="flex items-center gap-2 text-sm transition-colors hover:text-[--color-primary]" style={{ color: 'var(--color-text-secondary)' }}>
                <Mail className="w-3.5 h-3.5" /> hello@oceanblue.vn
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {t('navigation')}
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm transition-colors hover:text-[--color-primary]" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              Chi nhánh
            </h3>
            <ul className="space-y-3">
              {branches.map((b) => (
                <li key={b.name}>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{b.name}</p>
                  <p className="text-xs flex items-start gap-1 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {b.address}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" style={{ background: 'var(--color-border)' }} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <p>Made with ❤️ in Đà Nẵng</p>
        </div>
      </div>
    </footer>
  );
}
