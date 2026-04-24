import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/auth/current-user';
import { hasLocale, type AppLocale } from '@/i18n/config';
import type { AuthenticatedUser } from '@/types';

interface LocaleRouteAccess {
  locale: AppLocale;
  user: AuthenticatedUser;
}

/**
 * Ensures locale-scoped app pages only render for authenticated users.
 *
 * Example:
 * const { locale, user } = await requireLocaleUserAccess(params);
 */
export async function requireLocaleUserAccess(
  params: Promise<{ locale: string }>,
): Promise<LocaleRouteAccess> {
  const { locale } = await params;

  return requireLocaleValueAccess(locale);
}

/**
 * Ensures a validated locale can access authenticated app routes.
 *
 * Example:
 * const { locale, user } = await requireLocaleValueAccess(routeLocale);
 */
export async function requireLocaleValueAccess(
  locale: string,
): Promise<LocaleRouteAccess> {
  if (!hasLocale(locale)) {
    redirect('/pt-BR');
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/signin`);
  }

  return { locale, user };
}
