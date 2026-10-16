/**
 * Auth Utilities — Enterprise-Grade Cryptographic Session & Credential Management
 * - Backed by isolated server quantum vault: server/utils/vault-cipher.ts
 * - Dynamic Salt & Master Pepper: HMAC-PBKDF2-SHA512 with 100,000 iterations
 * - Side-Channel Defense: Constant-time comparison via crypto.timingSafeEqual
 * - Token Storage Hardening: Sessions persisted using Vault HMAC token indices
 * - Backward Compatibility: Seamless legacy verification & on-the-fly migration
 */
import { createHash, randomBytes } from 'node:crypto'
import fs from 'node:fs'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from './storage'
import {
  vaultTimingSafeEqual,
  vaultHashPassword,
  vaultVerifyPassword,
  vaultNeedsRehash,
  vaultHashToken
} from './vault-cipher'

// ───────────────────────────────────────────────
// Timing-Safe Equality Helper & Vault Delegations
// ───────────────────────────────────────────────
export const safeTimingCompare = vaultTimingSafeEqual
export const hashPassword = vaultHashPassword
export const verifyPassword = vaultVerifyPassword
export const needsRehash = vaultNeedsRehash

// ───────────────────────────────────────────────
// Admin Credentials (change password via admin UI)
// ───────────────────────────────────────────────
export const ADMIN_USERNAME = process.env.XO_ADMIN_USERNAME || 'admin'
export const ADMIN_PASSWORD_HASH = process.env.XO_ADMIN_PASSWORD_HASH || ''


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
  return vaultHashToken(rawToken)
}

function legacyHashToken(rawToken: string): string {
  return createHash('sha256').update(`sess:${rawToken}`).digest('hex')
}

function loadSessions(): SessionStore {
  try {
    const filePath = getSessionsFilePath()
    return readEncryptedJson<SessionStore>(filePath, {})
  } catch (e) {
    console.warn('[auth] Failed to load sessions file, starting fresh.')
  }
  return {}
}

function saveSessions(store: SessionStore): void {
  try {
    const filePath = getSessionsFilePath()
    writeEncryptedJson(filePath, store)
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
  const legacyKey = legacyHashToken(rawToken)

  // Look up by vault-hashed token index, with legacy fallback to sha256 index or raw token
  const sess = store[indexKey] || store[legacyKey] || store[rawToken]
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
  delete store[legacyHashToken(rawToken)]
  delete store[rawToken]
  store = cleanExpired(store)
  saveSessions(store)
}

export function destroyAllUserSessions(username: string): void {
  if (!username) return
  let store = loadSessions()
  let modified = false
  const targetLower = username.toLowerCase()
  for (const [key, sess] of Object.entries(store)) {
    if (sess.username && sess.username.toLowerCase() === targetLower) {
      delete store[key]
      modified = true
    }
  }
  if (modified) {
    store = cleanExpired(store)
    saveSessions(store)
  }
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
