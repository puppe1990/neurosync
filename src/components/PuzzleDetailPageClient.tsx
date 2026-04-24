'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import AppRouteShell from '@/components/AppRouteShell';
import TutorialOverlay from '@/components/TutorialOverlay';
import { IconMap } from '@/icons';
import { Link } from '@/i18n/navigation';
import { readStoredUserStats } from '@/lib/user-stats';
import type { AppLocale } from '@/i18n/config';
import type {
  AuthenticatedUser,
  Difficulty,
  PuzzleConfig,
  UserStats,
} from '@/types';

const puzzleMessageKeys = {
  'math-rush': 'mathRush',
  'grid-memory': 'gridMemory',
  'stroop-test': 'stroopTest',
  'shape-stack': 'shapeStack',
  'pattern-pursuit': 'patternPursuit',
  'neural-react': 'neuralReact',
} as const;

interface PuzzleDetailPageClientProps {
  locale: AppLocale;
  puzzle: PuzzleConfig;
  user: AuthenticatedUser;
}

/**
 * Routed puzzle detail page that mirrors the home-screen detail card interaction.
 *
 * Example:
 * <PuzzleDetailPageClient locale="en" puzzle={puzzle} user={user} />
 */
export default function PuzzleDetailPageClient({
  locale,
  puzzle,
  user,
}: PuzzleDetailPageClientProps) {
  const t = useTranslations('app');
  const puzzleT = useTranslations('puzzles');
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('NORMAL');
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats] = useState<UserStats>(readStoredUserStats);

  const key = puzzleMessageKeys[puzzle.id as keyof typeof puzzleMessageKeys];
  const localizedPuzzle = key
    ? {
        name: puzzleT(`${key}.name`),
        description: puzzleT(`${key}.description`),
      }
    : {
        name: puzzle.name,
        description: puzzle.description,
      };
  const iconKey = puzzle.icon as keyof typeof IconMap;
  const Icon = IconMap[iconKey];

  return (
    <AppRouteShell
      locale={locale}
      summary={localizedPuzzle.description}
      title={localizedPuzzle.name}
      user={user}
    >
      <section className="mx-auto max-w-2xl">
        <Link
          className="brutalist-button mb-8 inline-flex items-center gap-2"
          href="/"
          locale={locale}
        >
          <IconMap.ChevronLeft size={14} />
          <span>{t('back')}</span>
        </Link>

        <div className="bg-white brutalist-card p-8">
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-black bg-brand-blue shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {Icon ? <Icon className="text-white" size={40} /> : null}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
                {puzzle.category}
              </span>
              <h2 className="text-4xl font-black uppercase tracking-tight">
                {localizedPuzzle.name}
              </h2>
            </div>
          </div>

          <p className="mb-8 text-xl font-bold italic leading-relaxed text-gray-600">
            "{localizedPuzzle.description}"
          </p>

          <div className="mb-8 grid grid-cols-2 gap-6">
            <div className="rounded-2xl border-4 border-black bg-brand-yellow p-5">
              <span className="mb-1 block text-[10px] font-black uppercase opacity-50">
                {t('record')}
              </span>
              <span className="text-3xl font-black">
                {stats.bestScores[puzzle.id] || '0000'}
              </span>
            </div>
            <div className="rounded-2xl border-4 border-black bg-brand-green/20 p-5">
              <span className="mb-1 block text-[10px] font-black uppercase opacity-50">
                {t('status')}
              </span>
              <span className="text-xl font-black uppercase">
                {selectedDifficulty}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <span className="mb-3 block text-[10px] font-black uppercase opacity-50">
              {t('intensity')}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['EASY', 'NORMAL', 'HARD', 'CHAMPION'] as Difficulty[]).map(
                (difficulty) => (
                  <button
                    key={difficulty}
                    className={`rounded-xl border-4 border-black px-1 py-2 text-[10px] font-black transition-all ${
                      selectedDifficulty === difficulty
                        ? 'bg-brand-blue text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                        : 'bg-white hover:bg-brand-yellow'
                    }`}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    type="button"
                  >
                    {difficulty}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mb-8 flex gap-4">
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-4 border-black bg-white py-6 text-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setShowTutorial(true)}
              type="button"
            >
              <IconMap.HelpCircle size={24} />
              {t('howToPlay')}
            </button>
            <Link
              className="flex-[2] rounded-2xl border-4 border-black bg-brand-blue py-6 text-center text-xl font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              href={{
                pathname: '/games/[gameId]/play',
                params: { gameId: puzzle.id },
              }}
              locale={locale}
            >
              {t('startTraining')}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {showTutorial && puzzle.tutorial ? (
            <TutorialOverlay
              onClose={() => setShowTutorial(false)}
              steps={puzzle.tutorial}
            />
          ) : null}
        </AnimatePresence>
      </section>
    </AppRouteShell>
  );
}
