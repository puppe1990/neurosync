'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconMap } from '@/icons';
import { Link, useRouter } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { AppLocale } from '@/i18n/config';
import type { AuthenticatedUser } from '@/types';

interface AppRouteShellProps {
  children: React.ReactNode;
  locale: AppLocale;
  title: string;
  summary: string;
  user: AuthenticatedUser;
}

/**
 * Shared chrome for locale-authenticated routes outside the training home.
 *
 * Example:
 * <AppRouteShell locale={locale} summary="..." title="..." user={user}>...</AppRouteShell>
 */
export default function AppRouteShell({
  children,
  locale,
  summary,
  title,
  user,
}: AppRouteShellProps) {
  const router = useRouter();
  const t = useTranslations('app');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/signin', { locale });
  }

  return (
    <div className="min-h-screen bg-[#fff7e8] p-4 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl flex-col">
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link className="flex items-center gap-4" href="/" locale={locale}>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-brand-blue shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <IconMap.Brain className="text-white" size={30} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-orange">
                  NeuroSync
                </p>
                <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
                  {title}
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border-4 border-black bg-white px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {t('player')}
              </p>
              <p className="text-sm font-black uppercase">{user.name}</p>
            </div>
            <LanguageSwitcher />
            <button
              className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black bg-brand-orange text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
              disabled={isLoggingOut}
              onClick={handleLogout}
              title={t('logout')}
              type="button"
            >
              <IconMap.LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1">
          <section className="mb-8 rounded-[2rem] border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-brand-orange">
              {title}
            </p>
            <p className="max-w-3xl text-lg font-bold leading-relaxed text-gray-700">
              {summary}
            </p>
          </section>
          {children}
        </main>

        <footer className="mt-10 flex flex-wrap items-center gap-3 border-t-4 border-black/10 pt-6">
          <Link className="brutalist-button" href="/" locale={locale}>
            {t('home')}
          </Link>
          <Link className="brutalist-button" href="/profile" locale={locale}>
            {t('profile')}
          </Link>
          <Link className="brutalist-button" href="/history" locale={locale}>
            {t('history')}
          </Link>
          <Link className="brutalist-button" href="/rankings" locale={locale}>
            {t('rankings')}
          </Link>
          <Link className="brutalist-button" href="/settings" locale={locale}>
            {t('settings')}
          </Link>
        </footer>
      </div>
    </div>
  );
}
