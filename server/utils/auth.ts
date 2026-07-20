/**
 * Auth Utilities — Server-side session management for Xo Admin Panel
 * Uses SHA-256 password hashing + in-memory session store with expiry.
 */
import { createHash, randomBytes } from 'crypto'

// ───────────────────────────────────────────────
// Admin Credentials (change password via admin UI)
// ───────────────────────────────────────────────
export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD_HASH = hashPassword('xiaoxi') // default password

function hashPassword(plain: string): string {
  // SHA-256 with a fixed site salt for production hardening
  return createHash('sha256').update(`xo-studio:${plain}`).digest('hex')
}

export function verifyPassword(plain: string, storedHash: string): boolean {
  return hashPassword(plain) === storedHash
}

// ───────────────────────────────────────────────
// In-Memory Session Store
// ───────────────────────────────────────────────
interface Session {
  username: string
  createdAt: number
  expiresAt: number
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const sessions = new Map<string, Session>()

// Periodic cleanup of expired sessions
function cleanExpired() {
  const now = Date.now()
  for (const [token, sess] of sessions.entries()) {
    if (sess.expiresAt < now) sessions.delete(token)
  }
}

export function createSession(username: string): string {
  cleanExpired()
  const token = randomBytes(32).toString('hex')
  const now = Date.now()
  sessions.set(token, {
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  })
  return token
}

export function validateSession(token: string): Session | null {
  const sess = sessions.get(token)
  if (!sess) return null
  if (sess.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  return sess
}

export function destroySession(token: string): void {
  sessions.delete(token)
}

// ───────────────────────────────────────────────
// Cookie helpers
// ───────────────────────────────────────────────
export const SESSION_COOKIE = 'xo_admin_session'
export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_MS / 1000 // seconds
}
