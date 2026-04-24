'use client';

import dynamic from 'next/dynamic';
import type {AuthenticatedUser} from '@/types';

const App = dynamic(() => import('../App'), {ssr: false});

export default function ClientOnlyApp({initialUser}: {initialUser: AuthenticatedUser}) {
  return <App initialUser={initialUser} />;
}
