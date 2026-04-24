'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import AppRouteShell from '@/components/AppRouteShell';
import { PUZZLES, type AuthenticatedUser, type RankingEntry } from '@/types';
import type { AppLocale } from '@/i18n/config';

interface RankingsPageClientProps {
  locale: AppLocale;
  user: AuthenticatedUser;
}

function formatRankingDate(locale: string, value: string) {
  return new Date(value).toLocaleDateString(locale);
}

export default function RankingsPageClient({
  locale,
  user,
}: RankingsPageClientProps) {
  const activeLocale = useLocale();
  const t = useTranslations('app');
  const puzzleT = useTranslations('puzzles');
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/rankings?limit=25', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => setRankings(data.rankings ?? []))
      .catch(() => setRankings([]))
      .finally(() => setIsLoading(false));
  }, []);

  function getPuzzleName(puzzleId: string) {
    const key = {
      'math-rush': 'mathRush',
      'grid-memory': 'gridMemory',
      'stroop-test': 'stroopTest',
      'shape-stack': 'shapeStack',
      'pattern-pursuit': 'patternPursuit',
      'neural-react': 'neuralReact',
    }[puzzleId];

    return key ? puzzleT(`${key}.name`) : puzzleId;
  }

  return (
    <AppRouteShell
      locale={locale}
      summary={t('rankingsSummary')}
      title={t('rankings')}
      user={user}
    >
      <section className="rounded-[2rem] border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-12 gap-4 border-b-4 border-black bg-black p-6 text-[10px] font-black uppercase tracking-[0.25em] text-white">
          <span className="col-span-2">{t('rank')}</span>
          <span className="col-span-4">{t('player')}</span>
          <span className="col-span-3">{t('puzzle')}</span>
          <span className="col-span-3 text-right">{t('score')}</span>
        </div>

        <div className="divide-y-4 divide-black">
          {isLoading && (
            <div className="p-16 text-center text-sm font-black uppercase tracking-[0.25em] text-gray-400">
              {t('syncingRankings')}
            </div>
          )}

          {!isLoading &&
            rankings.map((entry) => (
              <article
                key={entry.id}
                className="grid grid-cols-12 items-center gap-4 bg-white p-6 transition-colors hover:bg-brand-yellow"
              >
                <div className="col-span-2">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-4 border-black bg-brand-blue text-xl font-black text-white">
                    {entry.rank}
                  </span>
                </div>
                <div className="col-span-4 min-w-0">
                  <p className="truncate font-black uppercase">
                    {entry.playerName}
                  </p>
                  <p className="text-[10px] font-black uppercase text-gray-500">
                    {formatRankingDate(activeLocale, entry.createdAt)}
                  </p>
                </div>
                <div className="col-span-3 min-w-0">
                  <p className="truncate font-black uppercase">
                    {getPuzzleName(entry.puzzleId)}
                  </p>
                  <p className="text-[10px] font-black uppercase text-gray-500">
                    {entry.difficulty}
                  </p>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-3xl font-black italic text-brand-orange">
                    {entry.score}
                  </p>
                  <p className="text-[10px] font-black uppercase text-gray-500">
                    {(entry.accuracy * 100).toFixed(0)}% /{' '}
                    {(entry.timeSpent / 1000).toFixed(1)}s
                  </p>
                </div>
              </article>
            ))}

          {!isLoading && rankings.length === 0 && (
            <div className="p-16 text-center text-sm font-black uppercase tracking-[0.25em] text-gray-400">
              {t('noScores')}
            </div>
          )}
        </div>
      </section>
    </AppRouteShell>
  );
}
