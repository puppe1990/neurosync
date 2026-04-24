import ClientOnlyApp from './client-only-app';
import {getCurrentUser} from '@/auth/current-user';
import {redirect} from 'next/navigation';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  return <ClientOnlyApp initialUser={user} />;
}
