import 'server-only';

import { cache } from 'react';
import { db } from '@/db/client';
import { findUserById } from '@/db/repositories';
import { toSafeUser } from './service';
import { getSession } from './session';

export const getCurrentUser = cache(async () => {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  const user = await findUserById(db, session.userId);
  return user ? toSafeUser(user) : null;
});
