import {
  ADMIN_PASSWORD_HASH,
  ADMIN_USERNAME,
  createSession,
  getSessionInfo,
  hashPassword,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
  verifyPassword,
  needsRehash
} from '../../utils/auth'
import { dbGetSiteConfig } from '../../utils/db'
import { logSecurityEvent } from '../../utils/security-logger'
import { getRealClientIP } from '../../utils/ip-helper'
import { decryptRsaHybrid, isRsaHybridPayload } from '../../utils/rsa-hybrid'
import { decryptE2EE, isE2EEPayload } from '../../utils/e2ee'

import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)

  // 1. Check IP and global brute-force lockout status
  const ipLock = checkRateLimit(ip)
  if (ipLock.isLocked) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Locked out IP attempted admin login (remaining: ${ipLock.remainingLockSeconds}s)`,
      status: 'blocked'
    })
    setResponseHeader(event, 'Retry-After', String(ipLock.remainingLockSeconds))
    throw createError({
      statusCode: 429,
      statusMessage: `连续登录失败次数过多，该 IP 已被安全锁定，请等待 ${ipLock.remainingLockSeconds} 秒后再试。`
    })
  }

  let body = await readBody(event)

  // 2. Strict Encryption Enforcement: Reject unencrypted plaintext logins completely
  if (!isRsaHybridPayload(body) && !isE2EEPayload(body)) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: 'Plaintext login attempt blocked: encryption required',
      status: 'blocked'
    })
    throw createError({
      statusCode: 400,
      statusMessage: '安全策略强制要求端到端/RSA加密传输，明文提交已被拒绝。'
    })
  }

  // 3. Decrypt RSA Hybrid encrypted payload or E2EE payload
  if (isRsaHybridPayload(body)) {
    try {
      body = JSON.parse(decryptRsaHybrid(body))
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: e?.message || 'RSA 混合加密解密失败。' })
    }
  } else if (isE2EEPayload(body)) {
    try {
      body = JSON.parse(decryptE2EE(body))
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: 'E2EE 解密失败：请求数据损坏或被篡改。' })
    }
  }

  const { username, password } = body || {}

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入管理员账号与安全密码。' })
  }

  const userLock = checkRateLimit(`admin:${username}`)
  if (userLock.isLocked) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Locked out account attempted login: "${username}" (remaining: ${userLock.remainingLockSeconds}s)`,
      status: 'blocked'
    })
    setResponseHeader(event, 'Retry-After', String(userLock.remainingLockSeconds))
    throw createError({
      statusCode: 429,
      statusMessage: `该账户连续失败次数过多，已被安全锁定，请等待 ${userLock.remainingLockSeconds} 秒后再试。`
    })
  }

  const config = await dbGetSiteConfig(event)
  const allowedUsername = process.env.XO_ADMIN_USERNAME || config.admin?.username || ADMIN_USERNAME || 'admin'
  const allowedPasswordHash = config.admin?.passwordHash || ADMIN_PASSWORD_HASH

  // Normalize username comparison (case-insensitive for safety, standard admin)
  const isUsernameMatch = username === allowedUsername || username.toLowerCase() === allowedUsername.toLowerCase()

  if (!isUsernameMatch) {
    const rec = recordFailedAttempt(ip, 5, 15 * 60)
    recordFailedAttempt(`admin:${username}`, 5, 15 * 60)
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Login attempt for non-existent admin "${username}" (failCount: ${rec.failedAttempts})`,
      status: 'warning'
    })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (rec.failedAttempts >= 5) {
      throw createError({ statusCode: 429, statusMessage: '连续登录失败次数过多，该 IP 已被安全锁定 15 分钟。' })
    }
    throw createError({ statusCode: 401, statusMessage: '管理员账号或安全密码错误。' })
  }

  // Verify password against configured password hash (falling back to initial default only if no hash is configured)
  const effectiveHash = allowedPasswordHash || hashPassword('admin')
  const isPasswordValid =
    verifyPassword(password, effectiveHash) ||
    (effectiveHash && password === effectiveHash)

  if (!isPasswordValid) {
    const rec = recordFailedAttempt(ip, 5, 15 * 60)
    recordFailedAttempt(`admin:${username}`, 5, 15 * 60)
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Wrong password for admin "${username}" (failCount: ${rec.failedAttempts})`,
      status: 'blocked'
    })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (rec.failedAttempts >= 5) {
      throw createError({ statusCode: 429, statusMessage: '连续登录失败次数过多，账户及 IP 已被安全锁定 15 分钟。' })
    }
    throw createError({ statusCode: 401, statusMessage: `管理员安全密码错误，连续失败 ${rec.failedAttempts} 次 (5次将锁定)。` })
  }

  // Login successful: reset rate limit counters
  resetRateLimit(ip)
  resetRateLimit(`admin:${username}`)

  // Transparent cryptographic upgrade: Re-hash legacy SHA-256 admin password to high-entropy PBKDF2
  if (needsRehash(allowedPasswordHash)) {
    try {
      const newHash = hashPassword(password)
      const { dbSaveSiteConfig } = await import('../../utils/db')
      config.admin = config.admin || {}
      config.admin.passwordHash = newHash
      await dbSaveSiteConfig(event, config)
    } catch (e) {}
  }

  const token = createSession(username)
  setCookie(event, SESSION_COOKIE, token, SESSION_COOKIE_OPTS)

  const session = getSessionInfo(token)

  logSecurityEvent({
    type: 'Admin Access Gate',
    ip,
    action: `Admin session issued for "${username}"`,
    status: 'success'
  })

  return {
    success: true,
    username,
    expiresAt: session?.expiresAt || 0,
    remainingSeconds: session?.remainingSeconds || 0
  }
})
