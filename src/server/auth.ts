import { AuthSessionUser } from '../types/index.js';
import { dbStore } from '../db/dbStore.js';
import crypto from 'crypto';

// In-memory active session store
const SESSIONS = new Map<string, AuthSessionUser>();

const SESSION_SECRET = process.env.SESSION_SECRET || 'reviewflow-secret-key-2026';

export function createSession(user: AuthSessionUser): string {
  const token = crypto.randomBytes(32).toString('hex');
  SESSIONS.set(token, user);
  return token;
}

export function getSessionUser(token?: string): AuthSessionUser | null {
  if (!token) return null;
  return SESSIONS.get(token) || null;
}

export function removeSession(token: string): boolean {
  return SESSIONS.delete(token);
}
