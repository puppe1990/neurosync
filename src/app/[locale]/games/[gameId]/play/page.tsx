import { notFound } from 'next/navigation';
import PuzzlePlayPageClient from '@/components/PuzzlePlayPageClient';
import { requireLocaleValueAccess } from '@/app/route-access';
import { getPuzzleById } from '@/lib/puzzle-registry';

interface GamePlayPageProps {
  params: Promise<{ locale: string; gameId: string }>;
}

export default async function GamePlayPage({ params }: GamePlayPageProps) {
  const { gameId, locale: routeLocale } = await params;
  const { locale, user } = await requireLocaleValueAccess(routeLocale);
  const puzzle = getPuzzleById(gameId);

  if (!puzzle) {
    notFound();
  }

  return <PuzzlePlayPageClient locale={locale} puzzle={puzzle} user={user} />;
}
