/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import enMessages from '../../messages/en.json';

const replaceSpy = vi.fn();
const usePathnameSpy = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => usePathnameSpy(),
  useRouter: () => ({
    replace: replaceSpy,
  }),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  replaceSpy.mockReset();
  usePathnameSpy.mockReset();
});

describe('LanguageSwitcher', () => {
  test('switches locale from root without duplicating the locale prefix', () => {
    usePathnameSpy.mockReturnValue('/en');

    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    expect(replaceSpy).toHaveBeenCalledWith('/', { locale: 'en' });
  });

  test('preserves supported localized sub-routes when switching locale', () => {
    usePathnameSpy.mockReturnValue('/en/rankings');

    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'PT-BR' }));

    expect(replaceSpy).toHaveBeenCalledWith('/rankings', { locale: 'pt-BR' });
  });

  test('preserves a game detail route when switching locale', () => {
    usePathnameSpy.mockReturnValue('/en/games/math-rush');

    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'PT-BR' }));

    expect(replaceSpy).toHaveBeenCalledWith(
      { pathname: '/games/[gameId]', params: { gameId: 'math-rush' } },
      { locale: 'pt-BR' },
    );
  });

  test('preserves a game play route when switching locale', () => {
    usePathnameSpy.mockReturnValue('/en/games/math-rush/play');

    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'PT-BR' }));

    expect(replaceSpy).toHaveBeenCalledWith(
      { pathname: '/games/[gameId]/play', params: { gameId: 'math-rush' } },
      { locale: 'pt-BR' },
    );
  });
});
