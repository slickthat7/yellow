import { AuthSessionUser } from '../types/index.js';
import crypto from 'crypto';

// In-memory active session store cache
const SESSIONS = new Map<string, AuthSessionUser>();

const SESSION_SECRET = process.env.SESSION_SECRET || 'reviewflow-secret-key-2026';

export function createSession(user: AuthSessionUser): string {
  const payloadStr = JSON.stringify({
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  });
  const payload = Buffer.from(payloadStr).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  const token = `${payload}.${signature}`;
  SESSIONS.set(token, user);
  return token;
}

export function getSessionUser(token?: string): AuthSessionUser | null {
  if (!token) return null;

  // Check in-memory map first
  if (SESSIONS.has(token)) {
    return SESSIONS.get(token)!;
  }

  // Stateless signature verification for serverless/cold-start instances
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decodedStr = Buffer.from(payload, 'base64url').toString('utf8');
    const data = JSON.parse(decodedStr);

    if (data.exp && Date.now() > data.exp) return null;

    const user: AuthSessionUser = {
      id: data.id,
      email: data.email,
      role: data.role,
      orgId: data.orgId,
      orgName: data.orgName,
      orgSlug: data.orgSlug,
    };

    // Cache back to memory for fast subsequent checks
    SESSIONS.set(token, user);
    return user;
  } catch (e) {
    return null;
  }
}

export function removeSession(token: string): boolean {
  return SESSIONS.delete(token);
}

