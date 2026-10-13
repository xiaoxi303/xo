/**
 * Auth Utilities — Enterprise-Grade Cryptographic Session & Credential Management
 * - Key Stretching: PBKDF2-HMAC-SHA512 (100,000 iterations) with CSPRNG per-hash salt
 * - Side-Channel Defense: Constant-time comparison via crypto.timingSafeEqual
 * - Token Storage Hardening: Sessions persisted using SHA-256 hashed token indices
 * - Backward Compatibility: Seamless legacy verification & on-the-fly migration
 */
import { createHash, randomBytes, pbkdf2Sync, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'

// ───────────────────────────────────────────────
// Timing-Safe Equality Helper
// ───────────────────────────────────────────────
export function safeTimingCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const hA = createHash('sha256').update(a).digest()
  const hB = createHash('sha256').update(b).digest()
  return timingSafeEqual(hA, hB)
}

// ───────────────────────────────────────────────
// Admin Credentials (change password via admin UI)
// ───────────────────────────────────────────────
export const ADMIN_USERNAME = process.env.XO_ADMIN_USERNAME || 'admin'
export const ADMIN_PASSWORD_HASH = process.env.XO_ADMIN_PASSWORD_HASH || ''

/**
 * Modern High-Entropy Password Hashing via PBKDF2-HMAC-SHA512
 * Produces standard modular format: $pbkdf2$100000$<salt_hex>$<hash_hex>
 */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex')
  const iterations = 100000
  const derivedKey = pbkdf2Sync(plain, salt, iterations, 32, 'sha512').toString('hex')
  return `$pbkdf2$${iterations}$${salt}$${derivedKey}`
}

/**
 * Timing-Safe Verification Supporting Modern PBKDF2 and Legacy Fallback
 */
export function verifyPassword(plain: string, storedHash: string): boolean {
  if (!plain || !storedHash) return false

  // 1. Modern PBKDF2-HMAC-SHA512 hash format
  if (storedHash.startsWith('$pbkdf2$')) {
    const parts = storedHash.split('$')
    if (parts.length === 5) {
      const iterations = parseInt(parts[2], 10) || 100000
      const salt = parts[3]
      const expectedHash = parts[4]
      const computed = pbkdf2Sync(plain, salt, iterations, 32, 'sha512').toString('hex')
      return safeTimingCompare(computed, expectedHash)
    }
  }

  // 2. Legacy SHA-256 with static site salt: `xo-studio:${plain}`
  const legacyHash = createHash('sha256').update(`xo-studio:${plain}`).digest('hex')
  if (safeTimingCompare(legacyHash, storedHash)) {
    return true
  }

  // 3. Raw hex digest fallback for un-salted migration hashes
  const rawHash = createHash('sha256').update(plain).digest('hex')
  if (safeTimingCompare(rawHash, storedHash)) {
    return true
  }

  return false
}

export function needsRehash(storedHash: string): boolean {
  return !storedHash || !storedHash.startsWith('$pbkdf2$')
}

// ───────────────────────────────────────────────
// Hardened Disk-Persisted Session Store
// Tokens on disk are stored as SHA-256 hashes to prevent session hijacking
// ───────────────────────────────────────────────
interface Session {
  username: string
  createdAt: number
  expiresAt: number
}

type SessionStore = Record<string, Session>

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSessionsFilePath(): string {
  return getRuntimeDataPath('.sessions.json')
}

function hashToken(rawToken: string): string {
  return createHash('sha256').update(`sess:${rawToken}`).digest('hex')
}

function loadSessions(): SessionStore {
  try {
    const filePath = getSessionsFilePath()
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw) as SessionStore
    }
  } catch (e) {
    console.warn('[auth] Failed to load sessions file, starting fresh.')
  }
  return {}
}

function saveSessions(store: SessionStore): void {
  try {
    const filePath = getSessionsFilePath()
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), { encoding: 'utf-8', mode: 0o600 })
  } catch (e) {
    console.error('[auth] Failed to save sessions file:', e)
  }
}

function cleanExpired(store: SessionStore): SessionStore {
  const now = Date.now()
  const cleaned: SessionStore = {}
  for (const [key, sess] of Object.entries(store)) {
    if (sess.expiresAt >= now) {
      cleaned[key] = sess
    }
  }
  return cleaned
}

export function createSession(username: string): string {
  let store = loadSessions()
  store = cleanExpired(store)

  const rawToken = randomBytes(32).toString('hex')
  const indexKey = hashToken(rawToken)
  const now = Date.now()

  store[indexKey] = {
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS
  }
  saveSessions(store)
  return rawToken
}

export function validateSession(rawToken: string): Session | null {
  if (!rawToken || typeof rawToken !== 'string') return null
  const store = loadSessions()
  const indexKey = hashToken(rawToken)

  // Look up by hashed token index (modern), with legacy fallback to raw token
  const sess = store[indexKey] || store[rawToken]
  if (!sess) return null

  if (sess.expiresAt < Date.now()) {
    const cleaned = cleanExpired(store)
    saveSessions(cleaned)
    return null
  }
  return sess
}

export function getSessionInfo(rawToken: string): (Session & { remainingSeconds: number }) | null {
  const session = validateSession(rawToken)
  if (!session) return null

  return {
    ...session,
    remainingSeconds: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
  }
}

export function destroySession(rawToken: string): void {
  if (!rawToken) return
  let store = loadSessions()
  delete store[hashToken(rawToken)]
  delete store[rawToken]
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
