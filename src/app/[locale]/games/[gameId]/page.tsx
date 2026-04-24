import { notFound } from 'next/navigation';
import PuzzleDetailPageClient from '@/components/PuzzleDetailPageClient';
import { requireLocaleValueAccess } from '@/app/route-access';
import { getPuzzleById } from '@/lib/puzzle-registry';

interface GameDetailPageProps {
  params: Promise<{ locale: string; gameId: string }>;
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { gameId, locale: routeLocale } = await params;
  const { locale, user } = await requireLocaleValueAccess(routeLocale);
  const puzzle = getPuzzleById(gameId);

  if (!puzzle) {
    notFound();
  }

  return <PuzzleDetailPageClient locale={locale} puzzle={puzzle} user={user} />;
}
