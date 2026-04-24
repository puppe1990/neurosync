import SettingsPageClient from '@/components/SettingsPageClient';
import { requireLocaleUserAccess } from '@/app/route-access';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale, user } = await requireLocaleUserAccess(params);
  return <SettingsPageClient locale={locale} user={user} />;
}
