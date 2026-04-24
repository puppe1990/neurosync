/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import PuzzleDetailPageClient from '@/components/PuzzleDetailPageClient';
import { getPuzzleById } from '@/lib/puzzle-registry';
import type { AppLocale } from '@/i18n/config';
import type { AuthenticatedUser } from '@/types';
import enMessages from '../../messages/en.json';

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
  Link: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href:
      | string
      | {
          pathname: string;
          params?: Record<string, string>;
        };
  }) => {
    const normalizedHref =
      typeof href === 'string'
        ? href
        : href.pathname.replace('[gameId]', href.params?.gameId ?? '');

    return (
      <a href={normalizedHref} {...props}>
        {children}
      </a>
    );
  },
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

const locale: AppLocale = 'en';
const user: AuthenticatedUser = {
  id: 'user-1',
  name: 'Test Player',
  email: 'test@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderPuzzleDetailPage() {
  const puzzle = getPuzzleById('math-rush');

  if (!puzzle) {
    throw new Error('Expected puzzle "math-rush" to exist in registry.');
  }

  return render(
    <NextIntlClientProvider locale={locale} messages={enMessages}>
      <PuzzleDetailPageClient locale={locale} puzzle={puzzle} user={user} />
    </NextIntlClientProvider>,
  );
}

describe('PuzzleDetailPageClient', () => {
  test('renders localized puzzle detail interactions for a routed game page', () => {
    window.localStorage.setItem(
      'neurosync_stats',
      JSON.stringify({
        sessions: [],
        bestScores: { 'math-rush': 9876 },
        dailyStreak: 0,
      }),
    );

    renderPuzzleDetailPage();

    expect(screen.getByText('Math Rush')).toBeDefined();
    expect(screen.getByText('9876')).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'Start training' }).getAttribute('href'),
    ).toBe('/games/math-rush/play');

    fireEvent.click(screen.getByRole('button', { name: 'HARD' }));

    expect(screen.getByText('How to play?')).toBeDefined();
    expect(screen.getAllByText('HARD')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'How to play?' }));

    expect(
      screen.getByText('Observe a operação matemática no centro da tela.'),
    ).toBeDefined();
  });
});
