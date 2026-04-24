'use server';

import { redirect } from 'next/navigation';
import { db, ensureDatabaseReady } from '@/db/client';
import { signInWithPassword, signUpWithPassword } from '@/auth/service';
import { createSession, deleteSession } from '@/auth/session';
import { defaultLocale, getMessages, type AppLocale } from '@/i18n/config';

export interface AuthFormState {
  message?: string;
}

export async function signUpAction(
  locale: AppLocale,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const messages = await getMessages(locale);

  try {
    await ensureDatabaseReady();
    const user = await signUpWithPassword(db, {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    await createSession(user.id);
  } catch (error) {
    return { message: authErrorMessage(error, messages.auth.errors) };
  }

  redirect(`/${locale}`);
}

export async function signInAction(
  locale: AppLocale,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const messages = await getMessages(locale);

  try {
    await ensureDatabaseReady();
    const user = await signInWithPassword(db, {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    await createSession(user.id);
  } catch {
    return { message: messages.auth.errors.invalidCredentials };
  }

  redirect(`/${locale}`);
}

export async function logoutAction(locale: AppLocale = defaultLocale) {
  await deleteSession();
  redirect(`/${locale}/signin`);
}

function authErrorMessage(
  error: unknown,
  errors: {
    emailAlreadyExists: string;
    retry: string;
  },
) {
  if (error instanceof Error && /email already exists/i.test(error.message)) {
    return errors.emailAlreadyExists;
  }

  return errors.retry;
}
