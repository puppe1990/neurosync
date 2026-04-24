import { describe, expect, test } from 'vitest';
import enMessages from '../../messages/en.json';
import ptBrMessages from '../../messages/pt-BR.json';

function collectLeafPaths(
  value: unknown,
  prefix = '',
  result: string[] = [],
): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    result.push(prefix);
    return result;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    collectLeafPaths(nestedValue, nextPrefix, result);
  }

  return result;
}

describe('translation messages', () => {
  test('keeps the same translation key set in pt-BR and en', () => {
    const enPaths = collectLeafPaths(enMessages).sort();
    const ptBrPaths = collectLeafPaths(ptBrMessages).sort();

    expect(ptBrPaths).toEqual(enPaths);
  });

  test('translates critical auth copy in both locales', () => {
    expect(ptBrMessages.auth.signInTitle).toBe('Entrar');
    expect(ptBrMessages.auth.errors.invalidCredentials).toBe(
      'Email ou senha invalidos.',
    );
    expect(enMessages.auth.signInTitle).toBe('Sign in');
    expect(enMessages.auth.errors.invalidCredentials).toBe(
      'Invalid email or password.',
    );
  });

  test('translates primary app chrome in both locales', () => {
    expect(ptBrMessages.app.rankings).toBe('Ranking neural');
    expect(ptBrMessages.app.logout).toBe('Sair');
    expect(enMessages.app.rankings).toBe('Neural leaderboard');
    expect(enMessages.app.logout).toBe('Sign out');
  });
});
