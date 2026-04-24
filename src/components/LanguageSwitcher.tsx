'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type AppLocale } from '@/i18n/config';

type LocaleSwitcherPathname =
  | '/'
  | '/history'
  | '/profile'
  | '/rankings'
  | '/settings'
  | '/signin'
  | '/signup'
  | {
      pathname: '/games/[gameId]';
      params: { gameId: string };
    }
  | {
      pathname: '/games/[gameId]/play';
      params: { gameId: string };
    };

function getLocaleSafePathname(
  pathname: string,
  locale: AppLocale,
): LocaleSwitcherPathname {
  let normalizedPathname = pathname;
  const localePrefix = `/${locale}`;

  while (
    normalizedPathname === localePrefix ||
    normalizedPathname.startsWith(`${localePrefix}/`)
  ) {
    normalizedPathname = normalizedPathname.slice(localePrefix.length) || '/';
  }

  const gameDetailMatch = normalizedPathname.match(/^\/games\/([^/]+)$/);

  if (gameDetailMatch) {
    return {
      pathname: '/games/[gameId]',
      params: { gameId: gameDetailMatch[1] },
    };
  }

  const gamePlayMatch = normalizedPathname.match(/^\/games\/([^/]+)\/play$/);

  if (gamePlayMatch) {
    return {
      pathname: '/games/[gameId]/play',
      params: { gameId: gamePlayMatch[1] },
    };
  }

  if (
    normalizedPathname === '/' ||
    normalizedPathname === '/history' ||
    normalizedPathname === '/profile' ||
    normalizedPathname === '/rankings' ||
    normalizedPathname === '/settings' ||
    normalizedPathname === '/signin' ||
    normalizedPathname === '/signup'
  ) {
    return normalizedPathname;
  }

  return '/';
}

export default function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('localeSwitcher');
  const localeSafePathname = getLocaleSafePathname(pathname, locale);

  return (
    <div
      aria-label={t('label')}
      className="inline-flex items-center gap-2 rounded-2xl border-4 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      role="group"
    >
      {locales.map((nextLocale) => {
        const isActive = nextLocale === locale;

        return (
          <button
            key={nextLocale}
            className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
              isActive
                ? 'bg-brand-blue text-white'
                : 'bg-transparent text-gray-600 hover:bg-brand-yellow'
            }`}
            onClick={() =>
              router.replace(localeSafePathname, { locale: nextLocale })
            }
            type="button"
          >
            {t(nextLocale)}
          </button>
        );
      })}
    </div>
  );
}
