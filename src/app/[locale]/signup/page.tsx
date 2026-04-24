import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';
import { signUpAction } from '@/app/actions/auth';
import { getCurrentUser } from '@/auth/current-user';
import { getMessages, hasLocale } from '@/i18n/config';

interface SignUpPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!hasLocale(locale)) {
    redirect('/pt-BR/signup');
  }

  if (user) {
    redirect(`/${locale}`);
  }

  const messages = await getMessages(locale);

  return (
    <AuthShell
      eyebrow={messages.auth.signUpEyebrow}
      summary={messages.auth.summary}
      title={messages.auth.signUpTitle}
    >
      <AuthForm action={signUpAction.bind(null, locale)} mode="signup" />
    </AuthShell>
  );
}
