'use client';

import { useLocale, useTranslations } from 'next-intl';
import AppRouteShell from '@/components/AppRouteShell';
import { IconMap } from '@/icons';
import type { AppLocale } from '@/i18n/config';
import type { AuthenticatedUser } from '@/types';
import { useUserStats } from '@/components/useUserStats';

interface HistoryPageClientProps {
  locale: AppLocale;
  user: AuthenticatedUser;
}

function formatSessionDate(locale: string, value: string) {
  return new Date(value).toLocaleDateString(locale);
}

export default function HistoryPageClient({
  locale,
  user,
}: HistoryPageClientProps) {
  const activeLocale = useLocale();
  const t = useTranslations('app');
  const stats = useUserStats();

  return (
    <AppRouteShell
      locale={locale}
      summary={t('historySummary')}
      title={t('history')}
      user={user}
    >
      <section className="rounded-[2rem] border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b-4 border-black bg-black p-6 text-white">
          <h2 className="text-sm font-black uppercase tracking-[0.25em]">
            {t('latestSessions')}
          </h2>
          <IconMap.History className="text-brand-orange" size={20} />
        </div>

        <div className="divide-y-4 divide-black">
          {stats.sessions
            .slice()
            .reverse()
            .map((session) => (
              <article
                key={session.id}
                className="grid gap-4 bg-white p-6 transition-colors hover:bg-brand-yellow md:grid-cols-[1.2fr,1fr,auto]"
              >
                <div>
                  <p className="text-lg font-black uppercase">
                    {formatSessionDate(activeLocale, session.timestamp)}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
                    {session.results[0]?.category ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    {t('score')}
                  </p>
                  <p className="text-3xl font-black italic text-brand-blue">
                    #{session.results[0]?.score ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border-4 border-black bg-black px-4 py-3 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                    {t('brainAge')}
                  </p>
                  <p className="text-xl font-black">
                    {session.overallBrainAge}
                  </p>
                </div>
              </article>
            ))}

          {stats.sessions.length === 0 && (
            <div className="p-16 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-gray-400">
                {t('waitingHistory')}
              </p>
            </div>
          )}
        </div>
      </section>
    </AppRouteShell>
  );
}
