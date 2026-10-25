import { dbGetSiteConfig } from '../../utils/db'
import { getRealClientIP } from '../../utils/ip-helper'
import { logSecurityEvent } from '../../utils/security-logger'
import { checkRateLimit, recordFailedAttempt } from '../../utils/rate-limiter'
import { safeTimingCompare } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)

  // Rate limit suffix guessing probes
  const rateLimitKey = `suffix-probe:${ip}`
  const { isLocked, remainingLockSeconds } = checkRateLimit(rateLimitKey)
  if (isLocked) {
    throw createError({
      statusCode: 429,
      statusMessage: `探测请求过于频繁，已被暂时阻止，请等待 ${remainingLockSeconds} 秒。`
    })
  }

  const body = event.context.decryptedBody || (await readBody(event).catch(() => ({})))
  const candidateSuffix = String(body?.suffix || '').trim().toLowerCase()

  if (!candidateSuffix) {
    return { valid: false }
  }

  const config = await dbGetSiteConfig(event)
  const configuredPath = String(config.admin?.adminPath || 'admin').trim().toLowerCase()

  const isValid = safeTimingCompare(candidateSuffix, configuredPath)

  if (!isValid) {
    // Record failed probe attempt (max 10 probes in 10 minutes)
    recordFailedAttempt(rateLimitKey, 10, 10 * 60)
    logSecurityEvent({
      type: 'Admin Suffix Probe',
      ip,
      action: `Invalid admin suffix probe attempt: "${candidateSuffix}"`,
      status: 'warning'
    })
    // Constant time / small delay to prevent rapid suffix enumeration
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return { valid: isValid }
})
