import { SignJWT, jwtVerify } from 'jose';

const authSecret = process.env.AUTH_SECRET;

if (!authSecret && process.env.NODE_ENV === 'production') {
  // In production, AUTH_SECRET is critical.
  // For non-production/build environments, a warning might be acceptable if JWTs aren't strictly needed for all build steps.
  throw new Error('AUTH_SECRET environment variable is not set in production.');
}

// Fallback for non-production or if you want the build to pass even if AUTH_SECRET is missing.
// WARNING: Using a default/dummy secret is insecure. Ensure AUTH_SECRET is properly set in all environments.
const effectiveAuthSecret = authSecret || 'dummy-dev-secret-please-set-properly';
if (!authSecret) {
  console.warn(
    'WARNING: AUTH_SECRET environment variable is not set. ' +
    'Using a default secret for JWT operations. This is INSECURE and should NOT be used in production. ' +
    'Ensure AUTH_SECRET is set in your environment.'
  );
}

const key = new TextEncoder().encode(effectiveAuthSecret);

export type SessionDataPayload = {
  user: { id: number };
  expires: string;
  [key: string]: any; // Allow additional properties
};

export async function signToken(payload: SessionDataPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now') // Sets the 'exp' claim in the JWT
    .sign(key);
}

export async function verifyToken(input: string): Promise<SessionDataPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionDataPayload;
} 