'use client';

import dynamic from 'next/dynamic';
import type { AuthenticatedUser } from '@/types';
import type { AppLocale } from '@/i18n/config';

const App = dynamic(() => import('../App'), { ssr: false });

export default function ClientOnlyApp({
  initialUser,
  locale,
}: {
  initialUser: AuthenticatedUser;
  locale: AppLocale;
}) {
  return <App initialUser={initialUser} locale={locale} />;
}
