/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import AuthForm from '@/components/AuthForm';
import enMessages from '../../messages/en.json';
import ptBrMessages from '../../messages/pt-BR.json';

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

function noopAction() {
  return Promise.resolve({});
}

function renderAuthForm(
  locale: 'pt-BR' | 'en',
  messages: typeof ptBrMessages,
  mode: 'signin' | 'signup',
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthForm action={noopAction} mode={mode} />
    </NextIntlClientProvider>,
  );
}

describe('AuthForm translations', () => {
  test('renders Portuguese sign in copy', () => {
    renderAuthForm('pt-BR', ptBrMessages, 'signin');

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDefined();
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('Senha')).toBeDefined();
    expect(
      screen
        .getByRole('link', { name: 'Criar conta nova' })
        .getAttribute('href'),
    ).toBe('/signup');
  });

  test('renders English sign up copy', () => {
    renderAuthForm('en', enMessages, 'signup');

    expect(
      screen.getByRole('button', { name: 'Create account' }),
    ).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('Password')).toBeDefined();
    expect(
      screen
        .getByRole('link', { name: 'I already have an account' })
        .getAttribute('href'),
    ).toBe('/signin');
  });
});
