import {beforeEach, describe, expect, test} from 'vitest';
import {createTestDatabase, findUserByEmail} from '@/db/repositories';
import {signInWithPassword, signUpWithPassword} from './service';

let db: Awaited<ReturnType<typeof createTestDatabase>>;

beforeEach(async () => {
  db = await createTestDatabase();
});

describe('auth service', () => {
  test('signs up a user with a hashed password', async () => {
    const user = await signUpWithPassword(db, {
      name: 'Ada Lovelace',
      email: 'ADA@EXAMPLE.COM',
      password: 'Brain-1234',
    });

    const stored = await findUserByEmail(db, 'ada@example.com');

    expect(user.email).toBe('ada@example.com');
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toBe('Brain-1234');
  });

  test('rejects signin when the password is invalid', async () => {
    await signUpWithPassword(db, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Brain-1234',
    });

    await expect(
      signInWithPassword(db, {
        email: 'ada@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(/invalid credentials/i);
  });

  test('returns the user when signin credentials are valid', async () => {
    await signUpWithPassword(db, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Brain-1234',
    });

    const user = await signInWithPassword(db, {
      email: 'ada@example.com',
      password: 'Brain-1234',
    });

    expect(user).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
  });
});
