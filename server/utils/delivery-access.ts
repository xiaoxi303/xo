import { H3Event, createError, getCookie, setCookie } from 'h3'
import { dbGetUserRecord, dbRecordDeliveryWarning } from './db'
import {
  CLIENT_SESSION_COOKIE,
  destroySession,
  validateSession
} from './auth'
import { getRealClientIP } from './ip-helper'
import { logSecurityEvent } from './security-logger'

/**
 * The delivery guard is deliberately kept outside db.ts. It works with both
 * the D1 schema and the local users.json fallback, while keeping all project
 * access decisions in one place.
 */
export interface DeliveryIdentity {
  token: string
  session: { username: string; createdAt: number; expiresAt: number }
  user: any
}

export interface DeliveryViolationResult {
  username: string
  slug: string
  warningCount: number
  warned: boolean
  blacklisted: boolean
  reason: string
}

function isTruthyFlag(value: any): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function normalizeSlug(value: any): string {
  return String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .split('/')[0]
    .toLowerCase()
}

function parseAllowedProjects(value: any): Set<string> {
  if (Array.isArray(value)) {
    return new Set(value.map(normalizeSlug).filter(Boolean))
  }

  const raw = String(value || '').trim()
  if (!raw) return new Set()

  // Admin UI stores comma-separated slugs. Accept JSON arrays as well so the
  // guard remains compatible with older delivery records.
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return new Set(parsed.map(normalizeSlug).filter(Boolean))
    } catch {}
  }

  return new Set(raw.split(',').map(normalizeSlug).filter(Boolean))
}

async function loadUser(event: H3Event, username: string): Promise<any | null> {
  return dbGetUserRecord(event, username)
}

async function loadIdentity(event: H3Event): Promise<DeliveryIdentity | null> {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) return null

  const session = validateSession(token)
  if (!session) return null

  const user = await loadUser(event, session.username)
  if (!user) return null

  return { token, session, user }
}

function clearClientSession(event: H3Event): void {
  setCookie(event, CLIENT_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: -1
  })
}

/**
 * Record an unauthorized project attempt. The first attempt is a persisted
 * warning; subsequent attempts blacklist the account and invalidate its
 * current client session. This function intentionally does not throw so API
 * handlers can choose the most useful response for their workflow.
 */
export async function dbRecordDeliveryViolation(
  event: H3Event,
  params: { slug: string; username?: string; token?: string; reason?: string }
): Promise<DeliveryViolationResult> {
  const slug = normalizeSlug(params.slug)
  const identity = await loadIdentity(event)
  const username = String(params.username || identity?.session.username || '').trim()
  const user = identity?.user || (username ? await loadUser(event, username) : null)
  const reason = params.reason || `Unauthorized delivery access: ${slug}`

  if (!user || !username) {
    return { username, slug, warningCount: 0, warned: false, blacklisted: false, reason }
  }

  const violation = await dbRecordDeliveryWarning(
    event,
    user.id ?? username,
    reason,
    2
  )
  const warningCount = violation.warningCount
  const blacklisted = violation.isBlacklisted

  const token = params.token || identity?.token
  if (blacklisted && token) {
    destroySession(token)
    clearClientSession(event)
  }

  const ip = getRealClientIP(event)
  logSecurityEvent({
    type: 'Delivery Ownership Guard',
    ip,
    action: `${blacklisted ? 'Blacklisted' : 'Warning'} unauthorized project access by "${username}" (${slug})`,
    status: blacklisted ? 'blocked' : 'warning'
  })

  return { username, slug, warningCount, warned: !blacklisted, blacklisted, reason }
}

/**
 * Enforce project ownership for client sessions. Anonymous visitors retain the
 * existing public/password-protected project flow. Once a client session is
 * present, only slugs listed in allowedProjects may proceed.
 */
export async function assertDeliveryAccess(event: H3Event, slugInput: string): Promise<{
  authenticated: boolean
  username?: string
  user?: any
}> {
  const slug = normalizeSlug(slugInput)
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project slug.' })
  }

  const identity = await loadIdentity(event)
  if (!identity) {
    // Public projects and the existing password unlock screen remain usable.
    return { authenticated: false }
  }

  const { user, session, token } = identity
  if (isTruthyFlag(user.isBlacklisted)) {
    destroySession(token)
    clearClientSession(event)
    throw createError({ statusCode: 403, statusMessage: 'This client account is blocked from delivery access.' })
  }

  // Admin sessions are not ordinary customer deliveries and retain the
  // existing studio-wide access. A client whitelist does not broaden
  // project ownership: allowedProjects remains the source of truth.
  if (user.role === 'admin') {
    return { authenticated: true, username: session.username, user }
  }

  const allowedProjects = parseAllowedProjects(user.allowedProjects)
  if (allowedProjects.has(slug)) {
    return { authenticated: true, username: session.username, user }
  }

  const violation = await dbRecordDeliveryViolation(event, {
    slug,
    username: session.username,
    token,
    reason: `Client attempted to open a project outside its delivery authorization: ${slug}. Fees are non-refundable.`
  })

  if (violation.blacklisted) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized delivery access detected. This account is now blocked; fees are non-refundable.'
    })
  }

  throw createError({
    statusCode: 403,
    statusMessage: 'This project is not assigned to your account. This first attempt was recorded as a warning; repeat attempts will block the account and fees are non-refundable.'
  })
}

export function normalizeDeliverySlug(value: any): string {
  return normalizeSlug(value)
}
