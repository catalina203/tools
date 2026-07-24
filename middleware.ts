import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    request.nextUrl.pathname = '/en';
    return NextResponse.rewrite(request.nextUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*']
};