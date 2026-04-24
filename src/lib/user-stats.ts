import type { UserStats } from '@/types';

const USER_STATS_STORAGE_KEY = 'neurosync_stats';

export function createEmptyUserStats(): UserStats {
  return { sessions: [], bestScores: {}, dailyStreak: 0 };
}

export function readStoredUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return createEmptyUserStats();
  }

  const rawStats = window.localStorage.getItem(USER_STATS_STORAGE_KEY);

  if (!rawStats) {
    return createEmptyUserStats();
  }

  try {
    return JSON.parse(rawStats) as UserStats;
  } catch {
    return createEmptyUserStats();
  }
}

export function writeStoredUserStats(stats: UserStats) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(stats));
}
