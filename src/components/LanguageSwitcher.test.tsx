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
});
