import HistoryPageClient from '@/components/HistoryPageClient';
import { requireLocaleUserAccess } from '@/app/route-access';

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale, user } = await requireLocaleUserAccess(params);
  return <HistoryPageClient locale={locale} user={user} />;
}
