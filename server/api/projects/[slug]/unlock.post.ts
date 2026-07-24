/**
 * POST /api/projects/:slug/unlock
 * Server-side password verification for password-protected projects.
 * Returns a signed session token stored in a cookie — never exposes the raw password to the client.
 */
import { dbGetProjectPassword } from '../../../utils/db'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '../../../utils/security-logger'
import { getRealClientIP } from '../../../utils/ip-helper'

// In-memory unlock token store (project-scoped, lightweight)
// Each token is: { slug, expiresAt }
const unlockTokens = new Map<string, { slug: string; expiresAt: number }>()
const UNLOCK_TTL_MS = 4 * 60 * 60 * 1000 // 4 hours

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  const body = await readBody(event)
  const { password } = body || {}
  if (!password) throw createError({ statusCode: 400, statusMessage: '请输入访问密码。' })

  // Retrieve the stored password server-side (never sent to client)
  const storedPassword = await dbGetProjectPassword(event, slug)

  if (!storedPassword || storedPassword.trim() === '') {
    // No password set — project is public
    return { success: true, token: null, public: true }
  }

  if (password !== storedPassword) {
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

  // Password matches — issue a short-lived unlock token
  const token = randomBytes(24).toString('hex')
  const expiresAt = Date.now() + UNLOCK_TTL_MS
  unlockTokens.set(token, { slug, expiresAt })

  // Set as HTTP-only cookie so the token persists across refreshes
  setCookie(event, `unlock_${slug}`, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: UNLOCK_TTL_MS / 1000
  })

  return { success: true, token }
})

/**
 * Exported helper — used by GET /api/projects/:slug/check to validate unlock status
 */
export function validateUnlockToken(slug: string, token: string): boolean {
  const entry = unlockTokens.get(token)
  if (!entry) return false
  if (entry.slug !== slug) return false
  if (entry.expiresAt < Date.now()) {
    unlockTokens.delete(token)
    return false
  }
  return true
}
