import { createClient } from '@libsql/client';
import { and, desc, eq, sql } from 'drizzle-orm';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import type { Difficulty, PuzzleCategory } from '@/types';
import { gameResults, users, type GameResult, type User } from './schema';
import * as schema from './schema';

export type Database = LibSQLDatabase<typeof schema>;

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface CreateGameResultInput {
  puzzleId: string;
  category: PuzzleCategory;
  difficulty: Difficulty;
  score: number;
  accuracy: number;
  timeSpent: number;
}

export interface RankingEntry {
  rank: number;
  id: string;
  userId: string;
  playerName: string;
  puzzleId: string;
  category: string;
  difficulty: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  createdAt: string;
}

export async function createTestDatabase() {
  const client = createClient({ url: 'file::memory:' });
  const testDb = drizzle(client, { schema });

  await testDb.run(sql`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await testDb.run(sql`
    CREATE TABLE game_results (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      puzzle_id TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      accuracy REAL NOT NULL,
      time_spent INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  return testDb;
}

export async function createUser(
  db: Database,
  input: CreateUserInput,
): Promise<User> {
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);

  try {
    const [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name: input.name.trim(),
        email,
        passwordHash: input.passwordHash,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return user;
  } catch (error) {
    if (isUniqueEmailError(error)) {
      throw new Error('Email already exists');
    }

    throw error;
  }
}

export async function findUserByEmail(
  db: Database,
  email: string,
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  return user ?? null;
}

export async function findUserById(
  db: Database,
  id: string,
): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function createGameResult(
  db: Database,
  userId: string,
  input: CreateGameResultInput,
): Promise<GameResult> {
  const [result] = await db
    .insert(gameResults)
    .values({
      id: crypto.randomUUID(),
      userId,
      puzzleId: input.puzzleId,
      category: input.category,
      difficulty: input.difficulty,
      score: input.score,
      accuracy: input.accuracy,
      timeSpent: input.timeSpent,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return result;
}

export async function getRankings(
  db: Database,
  options: { limit?: number; puzzleId?: string } = {},
): Promise<RankingEntry[]> {
  const limit = Math.max(1, Math.min(options.limit ?? 25, 100));
  const filters = options.puzzleId
    ? eq(gameResults.puzzleId, options.puzzleId)
    : undefined;
  const rows = await db
    .select({
      id: gameResults.id,
      userId: gameResults.userId,
      playerName: users.name,
      puzzleId: gameResults.puzzleId,
      category: gameResults.category,
      difficulty: gameResults.difficulty,
      score: gameResults.score,
      accuracy: gameResults.accuracy,
      timeSpent: gameResults.timeSpent,
      createdAt: gameResults.createdAt,
    })
    .from(gameResults)
    .innerJoin(users, eq(gameResults.userId, users.id))
    .where(filters)
    .orderBy(desc(gameResults.score), desc(gameResults.createdAt))
    .limit(limit);

  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
  }));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isUniqueEmailError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  if (/unique|constraint/i.test(error.message)) {
    return true;
  }

  return 'cause' in error && isUniqueEmailError(error.cause);
}
