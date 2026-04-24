import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'neurosync_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  userId: string;
  expiresAt: string;
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encryptSession({
    userId,
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  return decryptSession(session);
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getEncodedSecret());
}

export async function decryptSession(
  session?: string,
): Promise<SessionPayload | null> {
  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(session, getEncodedSecret(), {
      algorithms: ['HS256'],
    });

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.expiresAt !== 'string'
    ) {
      return null;
    }

    if (new Date(payload.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return {
      userId: payload.userId,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

function getEncodedSecret() {
  const secret =
    process.env.SESSION_SECRET ??
    (process.env.NODE_ENV === 'production'
      ? undefined
      : 'local-development-session-secret-32');

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }

  return new TextEncoder().encode(secret);
}
