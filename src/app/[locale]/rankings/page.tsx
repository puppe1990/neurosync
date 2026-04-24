import RankingsPageClient from '@/components/RankingsPageClient';
import { requireLocaleUserAccess } from '@/app/route-access';

interface RankingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RankingsPage({ params }: RankingsPageProps) {
  const { locale, user } = await requireLocaleUserAccess(params);
  return <RankingsPageClient locale={locale} user={user} />;
}
