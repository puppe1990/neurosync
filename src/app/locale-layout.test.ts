import { createElement, isValidElement } from 'react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getMessages: vi.fn().mockResolvedValue({}),
}));

import LocaleLayout from '@/app/[locale]/layout';

describe('locale layout', () => {
  test('wraps locale routes in the localized html shell', async () => {
    const result = await LocaleLayout({
      children: createElement('div', null, 'content'),
      params: Promise.resolve({ locale: 'pt-BR' }),
    });

    expect(isValidElement(result)).toBe(true);
    expect(result.type).toBe('html');
    expect(result.props.lang).toBe('pt-BR');
  });
});
