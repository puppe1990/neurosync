'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthFormState } from '@/app/actions/auth';
import { Link } from '@/i18n/navigation';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}

export default function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === 'signup';
  const t = useTranslations('auth');

  return (
    <form action={formAction} className="space-y-5">
      {isSignup && (
        <label className="block">
          <span className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">
            {t('nameLabel')}
          </span>
          <input
            className="w-full bg-white border-4 border-black rounded-2xl px-4 py-3 font-black outline-none focus:bg-brand-yellow"
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            required
          />
        </label>
      )}

      <label className="block">
        <span className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">
          {t('emailLabel')}
        </span>
        <input
          className="w-full bg-white border-4 border-black rounded-2xl px-4 py-3 font-black outline-none focus:bg-brand-yellow"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label className="block">
        <span className="block text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">
          {t('passwordLabel')}
        </span>
        <input
          className="w-full bg-white border-4 border-black rounded-2xl px-4 py-3 font-black outline-none focus:bg-brand-yellow"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={isSignup ? 8 : 1}
          required
        />
      </label>

      {state.message && (
        <div className="bg-brand-red border-4 border-black rounded-2xl p-4 font-black text-white">
          {state.message}
        </div>
      )}

      <button
        className="w-full bg-brand-blue text-white border-4 border-black rounded-2xl py-5 font-black text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending
          ? t('processing')
          : isSignup
            ? t('createAccount')
            : t('signInCta')}
      </button>

      <div className="text-center text-sm font-black uppercase">
        {isSignup ? (
          <Link
            className="underline decoration-4 underline-offset-4"
            href="/signin"
          >
            {t('alreadyHaveAccount')}
          </Link>
        ) : (
          <Link
            className="underline decoration-4 underline-offset-4"
            href="/signup"
          >
            {t('createNewAccount')}
          </Link>
        )}
      </div>
    </form>
  );
}
