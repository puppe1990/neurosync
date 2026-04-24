/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import PuzzlePlayPageClient from '@/components/PuzzlePlayPageClient';
import { getPuzzleById } from '@/lib/puzzle-registry';
import type { AppLocale } from '@/i18n/config';
import type { AuthenticatedUser } from '@/types';
import enMessages from '../../messages/en.json';

const replaceSpy = vi.fn();
const fetchSpy = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
  }),
);

vi.stubGlobal('fetch', fetchSpy);

vi.mock('@/components/AppRouteShell', () => ({
  default: ({
    children,
    title,
    summary,
  }: {
    children: ReactNode;
    title: string;
    summary: string;
  }) => (
    <div data-summary={summary} data-title={title}>
      {children}
    </div>
  ),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: replaceSpy,
  }),
}));

vi.mock('@/components/MathRush', () => ({
  default: ({
    onFinish,
  }: {
    onFinish: (score: number, accuracy: number, timeSpent: number) => void;
  }) => (
    <button onClick={() => onFinish(4321, 0.87, 12000)} type="button">
      Finish Math Rush
    </button>
  ),
}));

vi.mock('@/components/GridMemory', () => ({
  default: () => <div>Grid Memory Mock</div>,
}));

vi.mock('@/components/StroopTest', () => ({
  default: () => <div>Stroop Test Mock</div>,
}));

vi.mock('@/components/ShapeStack', () => ({
  default: () => <div>Shape Stack Mock</div>,
}));

vi.mock('@/components/PatternPursuit', () => ({
  default: () => <div>Pattern Pursuit Mock</div>,
}));

vi.mock('@/components/NeuralReact', () => ({
  default: () => <div>Neural React Mock</div>,
}));

vi.mock('@/lib/audio', () => ({
  audio: {
    setMusicMode: vi.fn(),
  },
}));

const locale: AppLocale = 'en';
const user: AuthenticatedUser = {
  id: 'user-1',
  name: 'Test Player',
  email: 'test@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderPuzzlePlayPage() {
  const puzzle = getPuzzleById('math-rush');

  if (!puzzle) {
    throw new Error('Expected puzzle "math-rush" to exist in registry.');
  }

  return render(
    <NextIntlClientProvider locale={locale} messages={enMessages}>
      <PuzzlePlayPageClient locale={locale} puzzle={puzzle} user={user} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  fetchSpy.mockClear();
  replaceSpy.mockReset();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('PuzzlePlayPageClient', () => {
  test('persists a routed puzzle result and returns to the detail route', async () => {
    renderPuzzlePlayPage();

    fireEvent.click(screen.getByRole('button', { name: 'Finish Math Rush' }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: 'math-rush',
          category: 'Arithmetic',
          difficulty: 'NORMAL',
          score: 4321,
          accuracy: 0.87,
          timeSpent: 12000,
        }),
      });
    });

    expect(screen.getByText('4321')).toBeDefined();
    expect(screen.getByText('87%')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Next challenge' }));

    expect(replaceSpy).toHaveBeenCalledWith(
      { pathname: '/games/[gameId]', params: { gameId: 'math-rush' } },
      { locale: 'en' },
    );
  });
});
