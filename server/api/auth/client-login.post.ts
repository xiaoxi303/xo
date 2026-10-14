import { dbGetBlacklist, dbGetUserRecord, dbUpdateUser } from '../../utils/db'
import { verifyPassword, createSession, getSessionInfo, CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS, needsRehash, hashPassword } from '../../utils/auth'
import { logSecurityEvent } from '../../utils/security-logger'
import { getRealClientIP } from '../../utils/ip-helper'

import { decryptRsaHybrid, isRsaHybridPayload, vaultVerifySliderToken } from '../../utils/vault-cipher'

import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)

  const ipLock = checkRateLimit(`client-ip:${ip}`)
  if (ipLock.isLocked) {
    setResponseHeader(event, 'Retry-After', String(ipLock.remainingLockSeconds))
    throw createError({
      statusCode: 429,
      statusMessage: `登录尝试过于频繁，IP 已被安全锁定，请等待 ${ipLock.remainingLockSeconds} 秒。`
    })
  }

  let body = await readBody(event)

  // Strict Encryption Enforcement: Reject unencrypted plaintext logins completely
  if (!event.context.hybridDecrypted) {
    if (!isRsaHybridPayload(body)) {
      logSecurityEvent({
        type: 'Client Login Guard',
        ip,
        action: 'Plaintext client login attempt blocked: encryption required',
        status: 'blocked'
      })
      throw createError({
        statusCode: 400,
        statusMessage: '安全策略拦截：仅支持金库双舱混淆共识加密传输。'
      })
    }

    try {
      body = JSON.parse(decryptRsaHybrid(body))
    } catch {
      throw createError({ statusCode: 400, statusMessage: '安全策略拦截：请求未通过金库共识解密校验。' })
    }
  }

  const captchaToken = String(body?.captchaToken || '')
  const captchaCheck = vaultVerifySliderToken(captchaToken)
  if (!captchaCheck.valid) {
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Client login blocked: ${captchaCheck.reason || 'invalid slider captcha token'}`,
      status: 'blocked'
    })
    throw createError({
      statusCode: 400,
      statusMessage: captchaCheck.reason || '安全人机校验未通过，请滑动完成滑块安全校验后再试。'
    })
  }

  const { username, password } = body || {}

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码。' })
  }

  // Retrieve the raw user record (including password hash) through the shared D1/JSON adapter.
  const userRecord: any = await dbGetUserRecord(event, username)

  if (!userRecord) {
    const rec = recordFailedAttempt(`client-ip:${ip}`, 5, 15 * 60)
    recordFailedAttempt(`client-user:${username}`, 5, 15 * 60)
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Login attempt for non-existent user "${username}" (failCount: ${rec.failedAttempts})`,
      status: 'warning'
    })
    await new Promise(resolve => setTimeout(resolve, 800))
    if (rec.failedAttempts >= 5) {
      throw createError({ statusCode: 429, statusMessage: '连续登录失败次数过多，账户与 IP 已被临时锁定 15 分钟。' })
    }
    // Prevent account enumeration by returning identical 401 message as wrong password
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误。' })
  }

  // Verify client password with timing-safe comparison
  if (!verifyPassword(password, userRecord.password)) {
    const rec = recordFailedAttempt(`client-ip:${ip}`, 5, 15 * 60)
    recordFailedAttempt(`client-user:${username}`, 5, 15 * 60)
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Wrong password for user "${username}" (failCount: ${rec.failedAttempts})`,
      status: 'blocked'
    })
    await new Promise(resolve => setTimeout(resolve, 800))
    if (rec.failedAttempts >= 5) {
      throw createError({ statusCode: 429, statusMessage: '连续登录失败次数过多，账户与 IP 已被临时锁定 15 分钟。' })
    }
    throw createError({ statusCode: 401, statusMessage: `密码错误，请重新输入 (已失败 ${rec.failedAttempts}/5 次)。` })
  }

  // A blacklisted account cannot create a new client session.
  const blacklist = await dbGetBlacklist(event).catch(() => [])
  const usernameValue = String(userRecord.username || username).toLowerCase()
  const emailValue = String(userRecord.email || '').toLowerCase()
  const listed = blacklist.some((item: any) => {
    const value = String(item?.value || '').trim().toLowerCase()
    if (!value) return false
    const type = String(item?.type || '').toLowerCase()
    if (type === 'email' || type === 'mail') return value === emailValue
    return value === usernameValue || value === emailValue
  })
  if (userRecord.isBlacklisted || listed) {
    const matchingEntry = blacklist.find((item: any) => {
      const value = String(item?.value || '').trim().toLowerCase()
      return value && (value === usernameValue || value === emailValue)
    })
    let rawReason = userRecord.blacklistReason || matchingEntry?.reason || '账号已被管理员停用'
    if (rawReason.includes('Fees are non-refundable') || rawReason.includes('outside its delivery authorization')) {
      rawReason = '系统检测到异常越权访问记录，账号已被保护性冻结'
    }
    const friendlyReason = `该账号已被暂停使用（${rawReason}）。如有疑问请联系客服或管理员协助解封。`
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Blocked login for blacklisted user "${username}" (${rawReason})`,
      status: 'blocked'
    })
    throw createError({ statusCode: 403, statusMessage: friendlyReason })
  }

  // Reset rate limits on successful authentication
  resetRateLimit(`client-ip:${ip}`)
  resetRateLimit(`client-user:${username}`)

  // Transparent cryptographic upgrade: Re-hash legacy passwords to high-entropy PBKDF2-HMAC-SHA512
  if (needsRehash(userRecord.password)) {
    try {
      const upgradedHash = hashPassword(password)
      await dbUpdateUser(event, userRecord.id || userRecord.username, { password: upgradedHash })
    } catch (e) {}
  }

  // Create session and set cookie
  const token = createSession(username)
  setCookie(event, CLIENT_SESSION_COOKIE, token, SESSION_COOKIE_OPTS)
  const session = getSessionInfo(token)

  logSecurityEvent({
    type: 'Client Access Gate',
    ip,
    action: `Client session issued for "${username}"`,
    status: 'success'
  })

  return {
    success: true,
    username: userRecord.username,
    role: userRecord.role,
    deliverySuffix: userRecord.deliverySuffix || '',
    deliveryKeyHint: userRecord.deliveryKeyHint || '',
    expiresAt: session?.expiresAt || 0,
    remainingSeconds: session?.remainingSeconds || 0
  }
})
