'use client';

import { useEffect, useState } from 'react';
import { createEmptyUserStats, readStoredUserStats } from '@/lib/user-stats';
import type { UserStats } from '@/types';

export function useUserStats(): UserStats {
  const [stats, setStats] = useState<UserStats>(createEmptyUserStats);

  useEffect(() => {
    setStats(readStoredUserStats());
  }, []);

  return stats;
}
