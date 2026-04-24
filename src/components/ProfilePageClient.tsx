'use client';

import { useLocale, useTranslations } from 'next-intl';
import AppRouteShell from '@/components/AppRouteShell';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/config';
import { PUZZLES } from '@/types';
import { useUserStats } from '@/components/useUserStats';
import type { AuthenticatedUser } from '@/types';

interface ProfilePageClientProps {
  locale: AppLocale;
  user: AuthenticatedUser;
}

function formatMemberDate(locale: string, createdAt: string) {
  return new Date(createdAt).toLocaleDateString(locale);
}

export default function ProfilePageClient({
  locale,
  user,
}: ProfilePageClientProps) {
  const activeLocale = useLocale();
  const t = useTranslations('app');
  const stats = useUserStats();
  const bestScoreCount = Object.keys(stats.bestScores).length;

  return (
    <AppRouteShell
      locale={locale}
      summary={t('profileSummary')}
      title={t('profile')}
      user={user}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border-4 border-black bg-brand-gold p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">
            {t('player')}
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight">
            {user.name}
          </h2>
          <p className="mt-2 text-sm font-bold text-gray-700">{user.email}</p>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-gray-700">
            {t('memberSince')}
          </p>
          <p className="mt-2 text-lg font-black">
            {formatMemberDate(activeLocale, user.createdAt)}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[2rem] border-4 border-black bg-brand-red p-6 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              {t('dayStreak')}
            </p>
            <p className="mt-4 text-6xl font-black italic">
              {stats.dailyStreak}
            </p>
          </div>
          <div className="rounded-[2rem] border-4 border-black bg-brand-blue p-6 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              {t('totalGames')}
            </p>
            <p className="mt-4 text-6xl font-black italic">
              {stats.sessions.length}
            </p>
          </div>
          <div className="rounded-[2rem] border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t('bestScoresTracked')}
            </p>
            <p className="mt-4 text-3xl font-black uppercase tracking-tight">
              {bestScoreCount} / {PUZZLES.length}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-[2rem] border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-2xl font-black uppercase tracking-tight">
            {t('quickActions')}
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            className="brutalist-card bg-brand-yellow p-5"
            href="/"
            locale={locale}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t('home')}
            </p>
            <p className="mt-3 text-2xl font-black uppercase tracking-tight">
              {t('resumeTraining')}
            </p>
          </Link>
          <Link
            className="brutalist-card bg-brand-green/30 p-5"
            href="/history"
            locale={locale}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t('history')}
            </p>
            <p className="mt-3 text-2xl font-black uppercase tracking-tight">
              {t('openHistory')}
            </p>
          </Link>
          <Link
            className="brutalist-card bg-brand-orange/20 p-5"
            href="/rankings"
            locale={locale}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              {t('rankings')}
            </p>
            <p className="mt-3 text-2xl font-black uppercase tracking-tight">
              {t('openRankings')}
            </p>
          </Link>
        </div>
      </section>
    </AppRouteShell>
  );
}
