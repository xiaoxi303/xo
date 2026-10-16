import { dbCreatePasswordRequest, dbCheckRateLimitAndBlacklist, getD1Database } from '../utils/db'
import { getRuntimeDataPath, readEncryptedJson } from '../utils/storage'
import { validateSession, CLIENT_SESSION_COOKIE } from '../utils/auth'
import { sendApprovalEmail } from '../utils/email'
import { getRealClientIP } from '../utils/ip-helper'
import { checkRateLimit, recordFailedAttempt } from '../utils/rate-limiter'

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim()
}

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)

  // Enforce IP-based rate limiting (max 10 requests per 10 minutes)
  const rateLimitKey = `pwd_req:${ip}`
  const ipLock = checkRateLimit(rateLimitKey)
  if (ipLock.isLocked) {
    setResponseHeader(event, 'Retry-After', String(ipLock.remainingLockSeconds))
    throw createError({
      statusCode: 429,
      statusMessage: `密码申请请求过于频繁，已被临时限流，请等待 ${ipLock.remainingLockSeconds} 秒后再试。`
    })
  }

  const body = await readBody(event)

  // Validate mandatory fields
  const projectSlug = escapeHtml(body.projectSlug || '').slice(0, 100)
  const projectTitle = escapeHtml(body.projectTitle || '').slice(0, 200)

  if (!projectSlug || !projectTitle) {
    recordFailedAttempt(rateLimitKey, 10, 10 * 60)
    throw createError({
      statusCode: 400,
      statusMessage: '缺少必要参数（项目标识或标题）'
    })
  }

  // 1. Identify logged-in client if present
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  let clientEmail = ''

  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = escapeHtml(session.username || '').slice(0, 50)
      // Look up user email from database
      try {
        const db = await getD1Database(event)
        if (db) {
          const user = await db.prepare('SELECT email FROM users WHERE username = ?').bind(clientUsername).first() as any
          clientEmail = escapeHtml(user?.email || '').slice(0, 150)
        } else {
          const usersPath = getRuntimeDataPath('users.json')
          const users = readEncryptedJson<any[]>(usersPath, [])
          const user = users.find((u: any) => u.username === clientUsername)
          clientEmail = escapeHtml(user?.email || '').slice(0, 150)
        }
      } catch (e) {
        console.error('[password-requests] Failed to look up user email:', e)
      }
    }
  }

  // 2. Detect device type
  const userAgent = getHeader(event, 'user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
  const deviceType = isMobile ? 'Mobile' : 'PC'

  // 3. Build sanitized contact string
  const rawContact = escapeHtml(body.contact || '').slice(0, 200)
  const emailPart = rawContact || clientEmail || clientUsername || 'unknown'
  const finalContact = `${emailPart} | IP: ${ip} (${deviceType})`

  // 4. Rate-limit and blacklist check
  const check = await dbCheckRateLimitAndBlacklist(event, {
    username: clientUsername,
    contact: rawContact,
    ip
  })

  // 5. Determine status
  let status = 'approved'
  let reason = check.isWhitelisted ? '白名单客户自动通过' : '防刷校验通过，系统自动授权'

  if (check.isBlacklisted) {
    status = 'pending'
    reason = check.reason || '已被系统防刷保护或黑名单拦截，需管理员手动审核'
    recordFailedAttempt(rateLimitKey, 10, 10 * 60)
  }

  // 6. Build request data with sanitized fields
  const requestData = {
    clientName: escapeHtml(body.clientName || clientUsername || 'Direct Access').slice(0, 100),
    contact: finalContact,
    projectSlug,
    projectTitle,
    reason: escapeHtml(body.reason || '').slice(0, 500),
    clientUsername,
    clientEmail,
    ip,
    deviceType,
    status,
    isBlacklisted: check.isBlacklisted,
    isAutoBlacklisted: check.isAutoBlacklisted || false
  }

  try {
    await dbCreatePasswordRequest(event, requestData)

    if (status === 'approved') {
      sendApprovalEmail(event, requestData).catch(err => {
        console.error('Failed to send auto-approval email:', err)
      })
    }

    return {
      success: true,
      autoApproved: status === 'approved',
      isBlacklisted: check.isBlacklisted,
      message: status === 'approved'
        ? '您的授权申请已秒级自动通过！解密凭证已发送至您的联系邮箱（如有填写）。'
        : '申请已提交。由于频繁申请或风控限制，需管理员手动审核后生效。'
    }
  } catch (error) {
    console.error('Failed to create password request:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '提交申请失败，请稍后重试。'
    })
  }
})
