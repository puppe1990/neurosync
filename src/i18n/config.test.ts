import { describe, expect, test } from 'vitest';
import {
  defaultLocale,
  getMessages,
  hasLocale,
  locales,
  normalizeLocale,
} from '@/i18n/config';

describe('i18n config', () => {
  test('supports pt-BR and en locales', () => {
    expect(locales).toEqual(['pt-BR', 'en']);
    expect(defaultLocale).toBe('pt-BR');
  });

  test('normalizes locale candidates to supported values', () => {
    expect(normalizeLocale('pt')).toBe('pt-BR');
    expect(normalizeLocale('pt-BR')).toBe('pt-BR');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('es')).toBe('pt-BR');
  });

  test('checks whether a locale is supported', () => {
    expect(hasLocale('pt-BR')).toBe(true);
    expect(hasLocale('en')).toBe(true);
    expect(hasLocale('pt')).toBe(false);
  });

  test('loads translated auth messages for each locale', async () => {
    const ptBr = await getMessages('pt-BR');
    const en = await getMessages('en');

    expect(ptBr.auth.signInTitle).toBe('Entrar');
    expect(en.auth.signInTitle).toBe('Sign in');
    expect(ptBr.auth.signUpTitle).not.toBe(en.auth.signUpTitle);
  });
});
