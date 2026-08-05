import { dbGetProjectsRaw, dbGetPasswordRequests } from '../../../utils/db'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '../../../utils/security-logger'
import { getRealClientIP } from '../../../utils/ip-helper'
import { getDailyPassword, getBeijingDateString, verifyProjectPassword } from '../../../utils/password-utils'

const unlockTokens = new Map()
const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim().replace(/^\/+|\/+$/g, '').split('/')[0].toLowerCase()
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

  // 1. Check static password if configured
  let isPasswordValid = false
  if (project.password && verifyProjectPassword(password, project.password)) {
    isPasswordValid = true
  }

  // 2. Check today's dynamic daily password
  if (!isPasswordValid) {
    const todayPassword = getDailyPassword(slug)
    if (todayPassword && verifyProjectPassword(password, todayPassword)) {
      isPasswordValid = true
    }
  }

  // 3. Check historical application date passwords from approved requests
  if (!isPasswordValid) {
    const requests = await dbGetPasswordRequests(event).catch(() => [])
    for (const req of requests) {
      if (req.projectSlug === slug && req.status === 'approved' && req.createdAt) {
        const reqPwd = getDailyPassword(slug, 'XO_STUDIO_SALT', req.createdAt)
        if (verifyProjectPassword(password, reqPwd)) {
          isPasswordValid = true
          break
        }
      }
    }
  }

  if (!isPasswordValid) {
    const ip = getRealClientIP(event)
    logSecurityEvent({
      type: 'Project Password Guard',
      ip,
      action: 'Failed password attempt for project "' + slug + '"',
      status: 'blocked'
    })
    await new Promise(r => setTimeout(r, 600))
    throw createError({ statusCode: 401, statusMessage: '密码错误，请检查输入的授权密码。' })
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
