import { dbGetProjectsRaw, dbGetPasswordRequests } from '../../../utils/db'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '../../../utils/security-logger'
import { getRealClientIP } from '../../../utils/ip-helper'
import { getDailyPassword, getBeijingDateString, verifyProjectPassword } from '../../../utils/password-utils'
import { assertDeliveryAccess } from '../../../utils/delivery-access'
import { decryptRsaHybrid, isRsaHybridPayload } from '../../../utils/rsa-hybrid'
import { decryptE2EE, isE2EEPayload } from '../../../utils/e2ee'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../../../utils/rate-limiter'

const unlockTokens = new Map()
const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)
  const slug = String(getRouterParam(event, 'slug') || '').trim().replace(/^\/+|\/+$/g, '').split('/')[0].toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  // Rate limit unlock brute-force attempts
  const rateLimitKey = `unlock:${ip}:${slug}`
  const ipLock = checkRateLimit(rateLimitKey)
  if (ipLock.isLocked) {
    setResponseHeader(event, 'Retry-After', String(ipLock.remainingLockSeconds))
    throw createError({
      statusCode: 429,
      statusMessage: `授权密码尝试过于频繁，已被临时锁定，请等待 ${ipLock.remainingLockSeconds} 秒。`
    })
  }

  let body = await readBody(event)
  if (!event.context.hybridDecrypted && isRsaHybridPayload(body)) {
    try {
      body = JSON.parse(decryptRsaHybrid(body))
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: e?.message || 'RSA 请求解密失败' })
    }
  } else if (isE2EEPayload(body)) {
    try {
      body = JSON.parse(decryptE2EE(body))
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: 'E2EE 解密失败' })
    }
  }
  const { password } = body || {}
  if (!password) throw createError({ statusCode: 400, statusMessage: 'Please enter access password.' })

  // Get project info
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find((p) => p.slug === slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found.' })

  // Anonymous visitors can still use the public/password flow. Once a client
  // session exists, enforce that the project belongs to that client's delivery
  // authorization before checking any password variant.
  const deliveryAccess = await assertDeliveryAccess(event, slug)

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
        const reqPwd = getDailyPassword(slug, undefined, req.createdAt)
        if (verifyProjectPassword(password, reqPwd)) {
          isPasswordValid = true
          break
        }
      }
    }
  }

  if (!isPasswordValid) {
    const rec = recordFailedAttempt(rateLimitKey, 5, 15 * 60)
    logSecurityEvent({
      type: 'Project Password Guard',
      ip,
      action: `Failed password attempt for project "${slug}" (failCount: ${rec.failedAttempts})`,
      status: 'blocked'
    })
    await new Promise(r => setTimeout(r, 600))
    if (rec.failedAttempts >= 5) {
      throw createError({ statusCode: 429, statusMessage: '授权密码连续输入错误次数过多，已被临时锁定 15 分钟。' })
    }
    throw createError({ statusCode: 401, statusMessage: `密码错误，请检查输入的授权密码 (已失败 ${rec.failedAttempts}/5 次)。` })
  }

  // Reset rate limit on success
  resetRateLimit(rateLimitKey)

  // Password matches - generate unlock token
  const token = randomBytes(24).toString('hex')
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const expiresAt = tomorrow.getTime()

  // Bind authenticated unlock tokens to the client that earned them. Public
  // anonymous unlocks retain the legacy slug-only behavior.
  unlockTokens.set(token, {
    slug,
    expiresAt,
    date: getBeijingDateString(),
    username: deliveryAccess.username || ''
  })

  setCookie(event, 'unlock_' + slug, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor((expiresAt - Date.now()) / 1000)
  })

  return { success: true, token, date: getBeijingDateString() }
})

export function validateUnlockToken(slug, token, username = '') {
  const entry = unlockTokens.get(token)
  if (!entry) return false
  if (entry.slug !== slug) return false
  if (entry.username && entry.username !== username) return false

  const today = getBeijingDateString()
  if (entry.expiresAt < Date.now() || entry.date !== today) {
    unlockTokens.delete(token)
    return false
  }
  return true
}
