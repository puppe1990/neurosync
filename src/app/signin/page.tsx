import {redirect} from 'next/navigation';
import {signInAction} from '@/app/actions/auth';
import {getCurrentUser} from '@/auth/current-user';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';

export default async function SignInPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/');
  }

  return (
    <AuthShell eyebrow="Acesso neural" title="Entrar">
      <AuthForm action={signInAction} mode="signin" />
    </AuthShell>
  );
}
