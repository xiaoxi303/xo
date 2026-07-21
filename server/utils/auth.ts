/**
 * Auth Utilities — Server-side session management for Xo Admin Panel
 * Uses SHA-256 password hashing + disk-persisted session store.
 * Sessions survive server restarts and PM2 reloads.
 */
import { createHash, randomBytes } from 'crypto'
import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'

// ───────────────────────────────────────────────
// Admin Credentials (change password via admin UI)
// ───────────────────────────────────────────────
export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD_HASH = hashPassword('xiaoxi') // default password

export function hashPassword(plain: string): string {
  // SHA-256 with a fixed site salt for production hardening
  return createHash('sha256').update(`xo-studio:${plain}`).digest('hex')
}

export function verifyPassword(plain: string, storedHash: string): boolean {
  return hashPassword(plain) === storedHash
}

// ───────────────────────────────────────────────
// Disk-persisted Session Store
// ───────────────────────────────────────────────
interface Session {
  username: string
  createdAt: number
  expiresAt: number
}

type SessionStore = Record<string, Session>

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Resolve sessions file path from current working directory
function getSessionsFilePath(): string {
  return getRuntimeDataPath('.sessions.json')
}

function loadSessions(): SessionStore {
  try {
    const filePath = getSessionsFilePath()
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw) as SessionStore
    }
  } catch (e) {
    // Ignore corrupt sessions file — start fresh
    console.warn('[auth] Failed to load sessions file, starting fresh.')
  }
  return {}
}

function saveSessions(store: SessionStore): void {
  try {
    const filePath = getSessionsFilePath()
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8')
  } catch (e) {
    console.error('[auth] Failed to save sessions file:', e)
  }
}

function cleanExpired(store: SessionStore): SessionStore {
  const now = Date.now()
  const cleaned: SessionStore = {}
  for (const [token, sess] of Object.entries(store)) {
    if (sess.expiresAt >= now) {
      cleaned[token] = sess
    }
  }
  return cleaned
}

export function createSession(username: string): string {
  let store = loadSessions()
  store = cleanExpired(store)

  const token = randomBytes(32).toString('hex')
  const now = Date.now()
  store[token] = {
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  }
  saveSessions(store)
  return token
}

export function validateSession(token: string): Session | null {
  const store = loadSessions()
  const sess = store[token]
  if (!sess) return null
  if (sess.expiresAt < Date.now()) {
    // Expire it and clean up
    const cleaned = cleanExpired(store)
    saveSessions(cleaned)
    return null
  }
  return sess
}

export function destroySession(token: string): void {
  let store = loadSessions()
  delete store[token]
  store = cleanExpired(store)
  saveSessions(store)
}

// ───────────────────────────────────────────────
// Cookie helpers
// ───────────────────────────────────────────────
export const SESSION_COOKIE = 'xo_admin_session'
export const CLIENT_SESSION_COOKIE = 'xo_client_session'

export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_MS / 1000 // seconds
}
