import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// next-intl locale routing (Next.js 16 uses proxy.ts instead of middleware.ts)
export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
