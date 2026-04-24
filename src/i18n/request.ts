import { getRequestConfig } from 'next-intl/server';
import {
  defaultLocale,
  getMessages,
  hasLocale,
  normalizeLocale,
  type AppLocale,
} from '@/i18n/config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  let locale: AppLocale = defaultLocale;

  if (hasLocale(requestedLocale ?? '')) {
    locale = requestedLocale as AppLocale;
  } else {
    locale = normalizeLocale(requestedLocale);
  }

  return {
    locale,
    messages: await getMessages(locale),
  };
});
