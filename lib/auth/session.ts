import { cookies } from 'next/headers';
import type { NewUser } from '@/lib/db/schema';
import { signToken, verifyToken, SessionDataPayload } from './jwt';

// This file no longer imports or uses bcryptjs.

export async function getSession(): Promise<SessionDataPayload | null> {
  const sessionCookieValue = (await cookies()).get('session')?.value;
  if (!sessionCookieValue) {
    return null;
  }
  try {
    // verifyToken will ensure the token is not expired based on its 'exp' claim if signToken set it.
    return await verifyToken(sessionCookieValue);
  } catch (error) {
    // Token verification can fail for various reasons (e.g., expired, malformed, invalid signature)
    console.error('Failed to verify session token during getSession:', error);
    // Optionally, delete the invalid/expired cookie here if desired, though middleware also handles this.
    // (await cookies()).delete('session');
    return null;
  }
}

export async function setSession(user: Pick<NewUser, 'id'>): Promise<void> {
  if (user.id === null || user.id === undefined) {
    // Throw an error or handle appropriately if user.id is not available.
    // This indicates a programming error if called without a valid user ID.
    console.error('User ID is missing when trying to set session.');
    throw new Error('User ID is required to create a session.');
  }

  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  // The sessionPayload's 'expires' field is for application-level checks if needed,
  // while signToken also sets the JWT's own 'exp' claim.
  const sessionPayload: SessionDataPayload = {
    user: { id: user.id },
    expires: expiresInOneDay.toISOString(), // Application-specific expiration tracking
  };

  const encryptedSession = await signToken(sessionPayload);

  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay, // Cookie expiration
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

// The main signOut logic (including DB logging) is in app/(login)/actions.ts.
// If a simple cookie deletion utility were needed here (for Edge contexts perhaps),
// it could be added, but generally, use the server action for full sign-out.
// export async function clearSessionCookie() {
//   (await cookies()).delete('session');
// }
