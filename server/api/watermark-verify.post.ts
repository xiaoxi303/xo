import crypto from 'node:crypto'
import { dbGetSiteConfig } from '../utils/db'
import { getRealClientIP } from '../utils/ip-helper'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../utils/rate-limiter'
import { safeTimingCompare } from '../utils/auth'
import { getVaultRootSecret } from '../utils/storage'

export default defineEventHandler(async (event) => {
  const body = event.context.decryptedBody || (await readBody(event).catch(() => ({})))
  const siteConfig = await dbGetSiteConfig(event)
  const configuredPassword = siteConfig?.watermark?.extractPassword || ''

  // Action: Check if extraction password has been set in admin
  if (body?.action === 'check') {
    return {
      isPasswordSet: !!configuredPassword && configuredPassword.trim().length > 0
    }
  }

  // Action: Verify user input password
  if (body?.action === 'verify') {
    const ip = getRealClientIP(event)
    const rateLimitKey = `watermark-verify:${ip}`
    const { isLocked, remainingLockSeconds } = checkRateLimit(rateLimitKey)
    if (isLocked) {
      setResponseHeader(event, 'Retry-After', String(remainingLockSeconds))
      throw createError({
        statusCode: 429,
        statusMessage: `尝试提取密码错误次数过多，IP 已被安全锁定，请等待 ${remainingLockSeconds} 秒。`
      })
    }

    if (!configuredPassword || configuredPassword.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '您尚未在后台设置提取密码，请先前往后台设置密码。'
      })
    }

    const inputPassword = String(body?.password || '').trim()
    const targetPassword = configuredPassword.trim()
    const isValid = safeTimingCompare(inputPassword, targetPassword)

    if (!isValid) {
      recordFailedAttempt(rateLimitKey, 5, 10 * 60)
      throw createError({
        statusCode: 401,
        statusMessage: '提取密码错误，请重新输入。'
      })
    }

    resetRateLimit(rateLimitKey)

    const now = Date.now()
    const invisibleText = siteConfig?.watermark?.invisibleText || '© Xo Studio 2026'
    const invisibleOpacity = siteConfig?.watermark?.invisibleOpacity ?? 3
    const certPayload = `XO_CERT:${invisibleText}:${invisibleOpacity}:${now}:${ip}`
    const certSig = crypto
      .createHmac('sha512', getVaultRootSecret())
      .update(certPayload)
      .digest('hex')

    return {
      success: true,
      watermarkInfo: {
        invisibleText,
        invisibleOpacity
      },
      certificate: {
        token: `XO_CERT_${now}_${certSig.slice(0, 64)}`,
        algorithm: 'HMAC-SHA512-VAULT-QUANTUM',
        issuedAt: new Date(now).toISOString(),
        subject: invisibleText
      }
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: '无效的验证请求操作。'
  })
})
