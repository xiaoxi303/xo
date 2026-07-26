/**
 * POST /api/projects/:slug/unlock
 * Server-side password verification for password-protected projects.
 * Supports both static passwords and daily rotating passwords.
 */
import { dbGetProjectPassword, dbGetProjectsRaw } from '../../../utils/db'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '../../../utils/security-logger'
import { getRealClientIP } from '../../../utils/ip-helper'
import { generateDailyPassword, getCurrentDateString } from '../../../utils/password'

// In-memory unlock token store (project-scoped, lightweight)
const unlockTokens = new Map<string, { slug: string; expiresAt: number; date: string }>()
const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours (expires at midnight)

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  const body = await readBody(event)
  const { password } = body || {}
  if (!password) throw createError({ statusCode: 400, statusMessage: '请输入访问密码。' })

  // Get project info
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find((p: any) => p.slug === slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: '作品不存在。' })

  // Check if project is password protected
  if (!project.isPasswordProtected) {
    return { success: true, token: null, public: true }
  }

  // Get the valid password
  let validPassword: string | null = null
  const today = getCurrentDateString()

  // First try static password from database
  const staticPassword = await dbGetProjectPassword(event, slug)
  
  if (staticPassword && staticPassword.trim() !== '') {
    // Use static password if available
    validPassword = staticPassword
  } else if (project.autoRotatePassword) {
    // Fall back to daily rotating password if no static password
    validPassword = generateDailyPassword(slug, today)
  }

  if (!validPassword || validPassword.trim() === '') {
    return { success: true, token: null, public: true }
  }

  // Verify password (case-insensitive comparison)
  if (password.toUpperCase() !== validPassword.toUpperCase()) {
    const ip = getRealClientIP(event)
    logSecurityEvent({
      type: 'Project Password Guard',
      ip,
      action: `Failed password attempt for project "${slug}"`,
      status: 'blocked'
    })
    // Artificial delay to resist brute-force
    await new Promise(r => setTimeout(r, 600))
    throw createError({ statusCode: 401, statusMessage: '密码错误，请联系作者获取授权密码。' })
  }

  // Password matches — issue a daily unlock token
  const token = randomBytes(24).toString('hex')
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const expiresAt = tomorrow.getTime()

  unlockTokens.set(token, { slug, expiresAt, date: today })

  // Set as HTTP-only cookie
  setCookie(event, `unlock_${slug}`, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor((expiresAt - Date.now()) / 1000)
  })

  return { success: true, token, date: today }
})

/**
 * Exported helper — used by GET /api/projects/:slug/check to validate unlock status
 */
export function validateUnlockToken(slug: string, token: string): boolean {
  const entry = unlockTokens.get(token)
  if (!entry) return false
  if (entry.slug !== slug) return false
  
  const today = getCurrentDateString()
  
  // Check if token is expired or from a different day
  if (entry.expiresAt < Date.now() || entry.date !== today) {
    unlockTokens.delete(token)
    return false
  }
  return true
}
