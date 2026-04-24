import { z } from 'zod';
import { getSession } from '@/auth/session';
import { db, ensureDatabaseReady } from '@/db/client';
import { createGameResult } from '@/db/repositories';

export const dynamic = 'force-dynamic';

const resultSchema = z.object({
  puzzleId: z.string().min(1),
  category: z.enum([
    'Arithmetic',
    'Memory',
    'Logic',
    'Spatial',
    'Visual',
    'Reaction',
  ]),
  difficulty: z.enum(['EASY', 'NORMAL', 'HARD', 'CHAMPION']),
  score: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(1),
  timeSpent: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.userId) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const parsed = resultSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { message: 'Invalid result payload' },
      { status: 400 },
    );
  }

  await ensureDatabaseReady();
  const result = await createGameResult(db, session.userId, parsed.data);
  return Response.json({ result }, { status: 201 });
}
