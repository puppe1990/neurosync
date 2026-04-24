import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { signInAction } from '@/app/actions/auth';
import { getCurrentUser } from '@/auth/current-user';
import { getMessages, hasLocale } from '@/i18n/config';

interface SignInPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!hasLocale(locale)) {
    redirect('/pt-BR/signin');
  }

  if (user) {
    redirect(`/${locale}`);
  }

  const messages = await getMessages(locale);

  return (
    <AuthShell
      eyebrow={messages.auth.signInEyebrow}
      summary={messages.auth.summary}
      title={messages.auth.signInTitle}
    >
      <AuthForm action={signInAction.bind(null, locale)} mode="signin" />
    </AuthShell>
  );
}
