import {redirect} from 'next/navigation';
import {signUpAction} from '@/app/actions/auth';
import {getCurrentUser} from '@/auth/current-user';
import AuthForm from '@/components/AuthForm';
import AuthShell from '@/components/AuthShell';

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/');
  }

  return (
    <AuthShell eyebrow="Novo perfil" title="Criar conta">
      <AuthForm action={signUpAction} mode="signup" />
    </AuthShell>
  );
}
