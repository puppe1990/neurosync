'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import AppRouteShell from '@/components/AppRouteShell';
import type { AppLocale } from '@/i18n/config';
import {
  readMusicPreference,
  writeMusicPreference,
} from '@/lib/client-preferences';
import type { AuthenticatedUser } from '@/types';

interface SettingsPageClientProps {
  locale: AppLocale;
  user: AuthenticatedUser;
}

export default function SettingsPageClient({
  locale,
  user,
}: SettingsPageClientProps) {
  const t = useTranslations('app');
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    setMusicEnabled(readMusicPreference());
  }, []);

  function toggleMusic() {
    const nextValue = !musicEnabled;
    setMusicEnabled(nextValue);
    writeMusicPreference(nextValue);

    import('@/lib/audio').then(({ audio }) => {
      audio.setMusicEnabled(nextValue);
    });
  }

  return (
    <AppRouteShell
      locale={locale}
      summary={t('settingsSummary')}
      title={t('settings')}
      user={user}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            {t('interfaceLanguage')}
          </p>
          <p className="mt-3 text-3xl font-black uppercase tracking-tight">
            {locale}
          </p>
        </section>

        <section className="rounded-[2rem] border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            {t('music')}
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-2xl font-black uppercase tracking-tight">
              {musicEnabled ? t('musicOn') : t('musicOff')}
            </p>
            <button
              className="brutalist-button"
              onClick={toggleMusic}
              type="button"
            >
              {musicEnabled ? t('disableMusic') : t('enableMusic')}
            </button>
          </div>
        </section>
      </div>
    </AppRouteShell>
  );
}
