import { getSession } from '@/auth/session';
import { db, ensureDatabaseReady } from '@/db/client';
import { getRankings } from '@/db/repositories';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.userId) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const puzzleId = url.searchParams.get('puzzleId') || undefined;
  const limit = Number(url.searchParams.get('limit') ?? 25);
  await ensureDatabaseReady();
  const rankings = await getRankings(db, { puzzleId, limit });

  return Response.json(
    { rankings },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
