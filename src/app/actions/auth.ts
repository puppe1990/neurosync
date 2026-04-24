'use server';

import { redirect } from 'next/navigation';
import { db } from '@/db/client';
import { signInWithPassword, signUpWithPassword } from '@/auth/service';
import { createSession, deleteSession } from '@/auth/session';

export interface AuthFormState {
  message?: string;
}

export async function signUpAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const user = await signUpWithPassword(db, {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    await createSession(user.id);
  } catch (error) {
    return { message: authErrorMessage(error) };
  }

  redirect('/');
}

export async function signInAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const user = await signInWithPassword(db, {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    await createSession(user.id);
  } catch {
    return { message: 'Email ou senha invalidos.' };
  }

  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/signin');
}

function authErrorMessage(error: unknown) {
  if (error instanceof Error && /email already exists/i.test(error.message)) {
    return 'Este email ja esta cadastrado.';
  }

  return 'Revise os dados e tente novamente.';
}
