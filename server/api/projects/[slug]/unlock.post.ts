import { dbGetProjectsRaw } from '../../../utils/db'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '../../../utils/security-logger'
import { getRealClientIP } from '../../../utils/ip-helper'
import { getDailyPassword, getBeijingDateString, verifyProjectPassword } from '../../../utils/password-utils'

const unlockTokens = new Map()
const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  const body = await readBody(event)
  const { password } = body || {}
  if (!password) throw createError({ statusCode: 400, statusMessage: 'Please enter access password.' })

  // Get project info
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find((p) => p.slug === slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found.' })

  // Check if password protection is enabled
  if (!project.isPasswordProtected) {
    return { success: true, token: null, public: true }
  }

  // Always use dynamic password based on slug
  const validPassword = getDailyPassword(slug)

  if (!validPassword || validPassword.trim() === '') {
    return { success: true, token: null, public: true }
  }

  // Verify password (case-insensitive)
  if (!verifyProjectPassword(password, validPassword)) {
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

  unlockTokens.set(token, { slug, expiresAt, date: getBeijingDateString() })

  setCookie(event, 'unlock_' + slug, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor((expiresAt - Date.now()) / 1000)
  })

  return { success: true, token, date: getBeijingDateString() }
})

export function validateUnlockToken(slug, token) {
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
