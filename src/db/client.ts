import 'server-only';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { ensureDatabaseSchema } from './bootstrap';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL ?? 'file:./.neurosync-local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({
  url,
  authToken,
});
const schemaReadyPromise = url.startsWith('file:')
  ? ensureDatabaseSchema(client)
  : Promise.resolve();

export const db = drizzle(client, { schema });

export async function ensureDatabaseReady() {
  await schemaReadyPromise;
}

export type AppDatabase = typeof db;
