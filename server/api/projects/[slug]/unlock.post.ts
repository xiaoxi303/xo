/**
 * POST /api/projects/:slug/unlock
 * Password verification API - supports static and dynamic passwords
 */
import { dbGetProjectsRaw, dbGetProjectPassword } from '../../../utils/db'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '../../../utils/security-logger'
import { getRealClientIP } from '../../../utils/ip-helper'
import { generateDailyPassword, getBeijingDateString, verifyPassword } from '../../../utils/password-utils'

// In-memory unlock token store
const unlockTokens = new Map<string, { slug: string; expiresAt: number; date: string }>()
const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  const body = await readBody(event)
  const { password } = body || {}
  if (!password) throw createError({ statusCode: 400, statusMessage: 'Please enter access password.' })

  // Get project info
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find((p: any) => p.slug === slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found.' })

  // Check if password protection is enabled
  if (!project.isPasswordProtected) {
    return { success: true, token: null, public: true }
  }

  // Get valid password - always use dynamic password (static password input removed)
  const today = getBeijingDateString()
  const validPassword = generateDailyPassword(slug, today)

  if (!validPassword || validPassword.trim() === '') {
    return { success: true, token: null, public: true }
  }

  // Verify password (case-insensitive)
  if (!verifyPassword(password, validPassword)) {
    const ip = getRealClientIP(event)
    logSecurityEvent({
      type: 'Project Password Guard',
      ip,
      action: 'Failed password attempt for project "' + slug + '"',
      status: 'blocked'
    })
    await new Promise(r => setTimeout(r, 600))
    throw createError({ statusCode: 401, statusMessage: 'Password incorrect, please contact the author.' })
  }

  // Password matches - generate unlock token
  const token = randomBytes(24).toString('hex')
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const expiresAt = tomorrow.getTime()

  unlockTokens.set(token, { slug, expiresAt, date: today })

  setCookie(event, 'unlock_' + slug, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor((expiresAt - Date.now()) / 1000)
  })

  return { success: true, token, date: today }
})

export function validateUnlockToken(slug: string, token: string): boolean {
  const entry = unlockTokens.get(token)
  if (!entry) return false
  if (entry.slug !== slug) return false

  const today = getBeijingDateString()
  if (entry.expiresAt < Date.now() || entry.date !== today) {
    unlockTokens.delete(token)
    return false
  }
  return true
}
