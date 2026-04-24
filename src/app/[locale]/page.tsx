import { redirect } from 'next/navigation';
import ClientOnlyApp from '@/app/client-only-app';
import { hasLocale } from '@/i18n/config';
import { getCurrentUser } from '@/auth/current-user';

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!hasLocale(locale)) {
    redirect('/pt-BR');
  }

  if (!user) {
    redirect(`/${locale}/signin`);
  }

  return <ClientOnlyApp initialUser={user} locale={locale} />;
}
