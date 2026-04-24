import { createClient } from '@libsql/client';
import { afterEach, describe, expect, test } from 'vitest';
import { ensureDatabaseSchema } from './bootstrap';

const tempDatabaseUrls: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDatabaseUrls.splice(0).map(async (url) => {
      const client = createClient({ url });
      await client.close();
    }),
  );
});

describe('database bootstrap', () => {
  test('creates required local tables when the database file is empty', async () => {
    const url = `file:./.tmp-test-${crypto.randomUUID()}.db`;
    tempDatabaseUrls.push(url);
    const client = createClient({ url });

    await ensureDatabaseSchema(client);

    const result = await client.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );

    expect(result.rows.map((row) => row.name)).toEqual(
      expect.arrayContaining(['game_results', 'users']),
    );
  });
});
