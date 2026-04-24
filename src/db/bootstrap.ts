import type { Client } from '@libsql/client';

export async function ensureDatabaseSchema(client: Client) {
  await client.batch(
    [
      {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `,
      },
      {
        sql: `
          CREATE TABLE IF NOT EXISTS game_results (
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
        `,
      },
    ],
    'write',
  );
}
