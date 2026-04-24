import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from '@/i18n/config';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/games/[gameId]': '/games/[gameId]',
    '/games/[gameId]/play': '/games/[gameId]/play',
    '/history': '/history',
    '/profile': '/profile',
    '/rankings': '/rankings',
    '/settings': '/settings',
    '/signin': '/signin',
    '/signup': '/signup',
  },
});
