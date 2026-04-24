import { hasLocale as nextIntlHasLocale } from 'next-intl';
import type enMessages from '../../messages/en.json';

export const locales = ['pt-BR', 'en'] as const;
export type AppLocale = (typeof locales)[number];
export type AppMessages = typeof enMessages;

export const defaultLocale: AppLocale = 'pt-BR';

const messageLoaders = {
  'pt-BR': () =>
    import('../../messages/pt-BR.json').then((module) => module.default),
  en: () => import('../../messages/en.json').then((module) => module.default),
} satisfies Record<AppLocale, () => Promise<AppMessages>>;

export function hasLocale(locale: string): locale is AppLocale {
  return nextIntlHasLocale(locales, locale);
}

export function normalizeLocale(locale: string | null | undefined): AppLocale {
  if (!locale) return defaultLocale;

  const lowerCasedLocale = locale.toLowerCase();

  if (lowerCasedLocale.startsWith('pt')) return 'pt-BR';
  if (lowerCasedLocale.startsWith('en')) return 'en';

  return defaultLocale;
}

export async function getMessages(locale: AppLocale): Promise<AppMessages> {
  return messageLoaders[locale]();
}
