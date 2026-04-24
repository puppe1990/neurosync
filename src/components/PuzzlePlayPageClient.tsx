'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import AppRouteShell from '@/components/AppRouteShell';
import GridMemory from '@/components/GridMemory';
import MathRush from '@/components/MathRush';
import NeuralReact from '@/components/NeuralReact';
import PatternPursuit from '@/components/PatternPursuit';
import ShapeStack from '@/components/ShapeStack';
import StroopTest from '@/components/StroopTest';
import { IconMap } from '@/icons';
import { useRouter } from '@/i18n/navigation';
import { readStoredUserStats, writeStoredUserStats } from '@/lib/user-stats';
import type { AppLocale } from '@/i18n/config';
import type {
  AuthenticatedUser,
  Difficulty,
  PuzzleConfig,
  PuzzleResult,
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

interface PuzzlePlayPageClientProps {
  locale: AppLocale;
  puzzle: PuzzleConfig;
  user: AuthenticatedUser;
}

function getLocalizedPuzzleCopy(
  puzzle: PuzzleConfig,
  puzzleT: ReturnType<typeof useTranslations<'puzzles'>>,
) {
  const key = puzzleMessageKeys[puzzle.id as keyof typeof puzzleMessageKeys];

  if (!key) {
    return { name: puzzle.name, description: puzzle.description };
  }

  return {
    name: puzzleT(`${key}.name`),
    description: puzzleT(`${key}.description`),
  };
}

function createPuzzleResult(
  puzzle: PuzzleConfig,
  difficulty: Difficulty,
  score: number,
  accuracy: number,
  timeSpent: number,
): PuzzleResult {
  return {
    puzzleId: puzzle.id,
    category: puzzle.category,
    difficulty,
    score,
    timeSpent,
    accuracy,
    timestamp: new Date().toISOString(),
  };
}

async function persistPuzzleResult(result: PuzzleResult) {
  await fetch('/api/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      puzzleId: result.puzzleId,
      category: result.category,
      difficulty: result.difficulty,
      score: result.score,
      accuracy: result.accuracy,
      timeSpent: result.timeSpent,
    }),
  });
}

function updateUserStatsWithResult(
  previousStats: UserStats,
  result: PuzzleResult,
): UserStats {
  const nextBestScores = { ...previousStats.bestScores };

  if ((nextBestScores[result.puzzleId] || 0) < result.score) {
    nextBestScores[result.puzzleId] = result.score;
  }

  const nextSession = {
    id: Math.random().toString(36).slice(2, 11),
    timestamp: result.timestamp,
    results: [result],
    overallBrainAge: 20 + Math.floor(Math.random() * 40),
  };

  return {
    ...previousStats,
    bestScores: nextBestScores,
    sessions: [...previousStats.sessions, nextSession],
  };
}

function renderPuzzleGame(
  puzzle: PuzzleConfig,
  difficulty: Difficulty,
  onFinish: (score: number, accuracy: number, timeSpent: number) => void,
) {
  if (puzzle.id === 'math-rush') {
    return (
      <MathRush difficulty={difficulty} isDaily={false} onFinish={onFinish} />
    );
  }

  if (puzzle.id === 'grid-memory') {
    return <GridMemory difficulty={difficulty} onFinish={onFinish} />;
  }

  if (puzzle.id === 'stroop-test') {
    return <StroopTest difficulty={difficulty} onFinish={onFinish} />;
  }

  if (puzzle.id === 'shape-stack') {
    return <ShapeStack difficulty={difficulty} onFinish={onFinish} />;
  }

  if (puzzle.id === 'pattern-pursuit') {
    return <PatternPursuit difficulty={difficulty} onFinish={onFinish} />;
  }

  return <NeuralReact onFinish={onFinish} />;
}

function ResultView({
  result,
  onBack,
}: {
  result: PuzzleResult;
  onBack: () => void;
}) {
  const t = useTranslations('app');

  return (
    <section className="mx-auto max-w-md text-center">
      <div className="relative mb-12 overflow-hidden rounded-3xl border-4 border-black bg-brand-blue p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute left-0 top-0 h-4 w-full bg-black/10" />
        <span className="mb-4 block text-xs font-black uppercase tracking-[0.2em] text-white opacity-80 underline decoration-2 underline-offset-4">
          {t('scoreLabel')}
        </span>
        <h2 className="mb-4 text-7xl font-black italic tracking-tighter text-white">
          {result.score}
        </h2>
        <div className="flex items-center justify-center gap-2 text-sm font-black uppercase text-brand-gold">
          <IconMap.Trophy size={20} />
          <span>{t('excellentPerformance')}</span>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-2 gap-6">
        <div className="rounded-2xl border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="mb-1 block text-[10px] font-black uppercase opacity-40">
            {t('accuracy')}
          </span>
          <span className="text-2xl font-black">
            {(result.accuracy * 100).toFixed(0)}%
          </span>
        </div>
        <div className="rounded-2xl border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="mb-1 block text-[10px] font-black uppercase opacity-40">
            {t('time')}
          </span>
          <span className="text-2xl font-black">
            {(result.timeSpent / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      <button
        className="w-full rounded-2xl border-4 border-black bg-brand-orange p-6 text-2xl font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-[2px]"
        onClick={onBack}
        type="button"
      >
        {t('nextChallenge')}
      </button>
    </section>
  );
}

/**
 * Routed gameplay surface that mirrors the original in-app training flow.
 *
 * Example:
 * <PuzzlePlayPageClient locale="en" puzzle={puzzle} user={user} />
 */
export default function PuzzlePlayPageClient({
  locale,
  puzzle,
  user,
}: PuzzlePlayPageClientProps) {
  const router = useRouter();
  const t = useTranslations('app');
  const puzzleT = useTranslations('puzzles');
  const localizedPuzzle = getLocalizedPuzzleCopy(puzzle, puzzleT);
  const [difficulty] = useState<Difficulty>('NORMAL');
  const [stats, setStats] = useState<UserStats>(readStoredUserStats);
  const [lastResult, setLastResult] = useState<PuzzleResult | null>(null);

  useEffect(() => {
    writeStoredUserStats(stats);
  }, [stats]);

  useEffect(() => {
    let cancelled = false;

    import('@/lib/audio').then(({ audio }) => {
      if (cancelled) {
        return;
      }

      audio.setMusicMode('upbeat');
    });

    return () => {
      cancelled = true;
      import('@/lib/audio').then(({ audio }) => {
        audio.setMusicMode('calm');
      });
    };
  }, []);

  function handleFinishPuzzle(
    score: number,
    accuracy: number,
    timeSpent: number,
  ) {
    const result = createPuzzleResult(
      puzzle,
      difficulty,
      score,
      accuracy,
      timeSpent,
    );

    persistPuzzleResult(result).catch(() => {
      // Local stats stay authoritative even when the network request fails.
    });
    setLastResult(result);
    setStats((previousStats) =>
      updateUserStatsWithResult(previousStats, result),
    );
  }

  function returnToPuzzleDetail() {
    router.replace(
      { pathname: '/games/[gameId]', params: { gameId: puzzle.id } },
      { locale },
    );
  }

  return (
    <AppRouteShell
      locale={locale}
      summary={localizedPuzzle.description}
      title={localizedPuzzle.name}
      user={user}
    >
      {lastResult ? (
        <ResultView onBack={returnToPuzzleDetail} result={lastResult} />
      ) : (
        <section className="space-y-4">
          <div className="rounded-2xl border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
              {difficulty}
            </p>
          </div>

          <div className="mb-4 rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {renderPuzzleGame(puzzle, difficulty, handleFinishPuzzle)}
          </div>

          <button
            className="brutalist-button"
            onClick={returnToPuzzleDetail}
            type="button"
          >
            {t('cancel')}
          </button>
        </section>
      )}
    </AppRouteShell>
  );
}
