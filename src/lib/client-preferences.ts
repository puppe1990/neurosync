const MUSIC_PREFERENCE_KEY = 'neurosync_music_enabled';

export function readMusicPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(MUSIC_PREFERENCE_KEY) === 'true';
}

export function writeMusicPreference(enabled: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(MUSIC_PREFERENCE_KEY, String(enabled));
}
