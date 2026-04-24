import {beforeEach, describe, expect, test} from 'vitest';
import {
  createGameResult,
  createTestDatabase,
  createUser,
  findUserByEmail,
  getRankings,
} from './repositories';

let db: Awaited<ReturnType<typeof createTestDatabase>>;

beforeEach(async () => {
  db = await createTestDatabase();
});

describe('user repository', () => {
  test('rejects duplicate user emails', async () => {
    await createUser(db, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hash-a',
    });

    await expect(
      createUser(db, {
        name: 'Ada Clone',
        email: 'ada@example.com',
        passwordHash: 'hash-b',
      }),
    ).rejects.toThrow(/email already exists/i);

    const user = await findUserByEmail(db, 'ada@example.com');
    expect(user?.name).toBe('Ada Lovelace');
  });
});

describe('game result repository', () => {
  test('stores each game result for the authenticated user', async () => {
    const ada = await createUser(db, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hash-a',
    });
    const grace = await createUser(db, {
      name: 'Grace Hopper',
      email: 'grace@example.com',
      passwordHash: 'hash-b',
    });

    const result = await createGameResult(db, ada.id, {
      puzzleId: 'math-rush',
      category: 'Arithmetic',
      difficulty: 'NORMAL',
      score: 1200,
      accuracy: 0.91,
      timeSpent: 45000,
    });
    await createGameResult(db, grace.id, {
      puzzleId: 'math-rush',
      category: 'Arithmetic',
      difficulty: 'NORMAL',
      score: 900,
      accuracy: 0.8,
      timeSpent: 52000,
    });

    expect(result.userId).toBe(ada.id);
    expect(result.userId).not.toBe(grace.id);
  });

  test('returns rankings ordered by score with player names', async () => {
    const ada = await createUser(db, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      passwordHash: 'hash-a',
    });
    const grace = await createUser(db, {
      name: 'Grace Hopper',
      email: 'grace@example.com',
      passwordHash: 'hash-b',
    });

    await createGameResult(db, ada.id, {
      puzzleId: 'grid-memory',
      category: 'Memory',
      difficulty: 'HARD',
      score: 850,
      accuracy: 0.88,
      timeSpent: 50000,
    });
    await createGameResult(db, grace.id, {
      puzzleId: 'math-rush',
      category: 'Arithmetic',
      difficulty: 'NORMAL',
      score: 1400,
      accuracy: 0.95,
      timeSpent: 41000,
    });

    const rankings = await getRankings(db, {limit: 10});

    expect(rankings.map((entry) => entry.playerName)).toEqual([
      'Grace Hopper',
      'Ada Lovelace',
    ]);
    expect(rankings.map((entry) => entry.rank)).toEqual([1, 2]);
    expect(rankings[0]).toMatchObject({
      puzzleId: 'math-rush',
      score: 1400,
    });
  });
});
