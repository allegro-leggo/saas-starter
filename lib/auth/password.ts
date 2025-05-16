import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainTextPassword, hashedPassword);
} 