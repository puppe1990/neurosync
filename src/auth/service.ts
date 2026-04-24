import {z} from 'zod';
import type {Database} from '@/db/repositories';
import {createUser, findUserByEmail} from '@/db/repositories';
import type {User} from '@/db/schema';
import {hashPassword, verifyPassword} from './password';

const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters'),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8, 'Password must have at least 8 characters'),
});

const signInSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type SafeUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;

export async function signUpWithPassword(
  db: Database,
  input: z.input<typeof signUpSchema>,
): Promise<SafeUser> {
  const parsed = signUpSchema.parse(input);
  const passwordHash = await hashPassword(parsed.password);
  const user = await createUser(db, {
    name: parsed.name,
    email: parsed.email,
    passwordHash,
  });

  return toSafeUser(user);
}

export async function signInWithPassword(
  db: Database,
  input: z.input<typeof signInSchema>,
): Promise<SafeUser> {
  const parsed = signInSchema.parse(input);
  const user = await findUserByEmail(db, parsed.email);

  if (!user || !(await verifyPassword(parsed.password, user.passwordHash))) {
    throw new Error('Invalid credentials');
  }

  return toSafeUser(user);
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
