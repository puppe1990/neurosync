import ProfilePageClient from '@/components/ProfilePageClient';
import { requireLocaleUserAccess } from '@/app/route-access';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale, user } = await requireLocaleUserAccess(params);
  return <ProfilePageClient locale={locale} user={user} />;
}
