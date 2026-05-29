'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { Menu, X, Waves, Globe, LogOut, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession, signOut } from 'next-auth/react';

const NAV_LINKS = [
  { key: 'findRoom' as const, href: '/#rooms' },
  { key: 'about' as const, href: '/about' },
  { key: 'contact' as const, href: '/contact' },
];

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentLocale = useLocale();

  // Always solid — hero is now light warm, transparent nav causes contrast issues
  const onSolid = true;

  const switchLocale = () =>
    router.replace(pathname, { locale: currentLocale === 'vi' ? 'en' : 'vi' });

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b"
      style={{ borderColor: 'var(--color-border)', boxShadow: '0 1px 12px rgba(100,60,20,0.06)' }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
            <Waves className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>
            Ocean Blue
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ key, href }) => {
            const active = href === '/#rooms' ? false : pathname.includes(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'text-white'
                    : 'hover:bg-[#F3EDE5]'
                )}
                style={active
                  ? { background: 'var(--color-primary)' }
                  : { color: 'var(--color-text-secondary)' }}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-1 text-xs hover:bg-[#F3EDE5]"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={switchLocale}
          >
            <Globe className="w-3.5 h-3.5" />
            {currentLocale === 'vi' ? 'EN' : 'VI'}
          </Button>

          {/* Auth */}
          {session ? (
            <DropdownMenu>
              {/* Use render prop so DropdownMenuTrigger renders AS Button — avoids button-in-button */}
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex gap-2 hover:bg-[#F3EDE5]"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="max-w-[120px] truncate text-sm">{session.user.name}</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem render={<Link href="/my-bookings" className="flex items-center gap-2" />}>
                  <Calendar className="w-4 h-4" /> {t('myBookings')}
                </DropdownMenuItem>
                {session.user.role === 'admin' && (
                  <DropdownMenuItem render={<Link href="/admin/dashboard" className="flex items-center gap-2" />}>
                    <User className="w-4 h-4" /> {t('dashboard')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-red-600"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" /> {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              size="sm"
              className="hidden md:inline-flex text-white hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              {t('login')}
            </Button>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-[#F3EDE5]"
                  style={{ color: 'var(--color-text-secondary)' }}
                  aria-label="Menu"
                />
              }
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                    <Waves className="w-3.5 h-3.5 text-white" />
                  </div>
                  Ocean Blue Homestay
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {NAV_LINKS.map(({ key, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#F5F8FA]"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t(key)}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--color-border)' }}>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2"
                    onClick={() => { switchLocale(); setMobileOpen(false); }}>
                    <Globe className="w-4 h-4" />
                    {currentLocale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                  </Button>
                  {session ? (
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-red-600"
                      onClick={() => signOut()}>
                      <LogOut className="w-4 h-4" /> {t('logout')}
                    </Button>
                  ) : (
                    <Button
                      render={<Link href="/login" onClick={() => setMobileOpen(false)} />}
                      nativeButton={false}
                      size="sm"
                      className="w-full text-white"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      {t('login')}
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
