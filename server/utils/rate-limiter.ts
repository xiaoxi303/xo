interface RateLimitRecord {
  failedAttempts: number
  lockedUntil: number
  lastAttempt: number
}

// In-memory store for rate limiting by identifier (e.g. IP, username, or IP:action)
const attemptsMap = new Map<string, RateLimitRecord>()

// Periodically clean up expired entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of attemptsMap.entries()) {
      if (now > record.lockedUntil && now - record.lastAttempt > 30 * 60 * 1000) {
        attemptsMap.delete(key)
      }
    }
  }, 5 * 60 * 1000)
  if (timer.unref) {
    timer.unref()
  }
}

/**
 * Check if an identifier is currently locked out due to excessive failed attempts.
 */
export function checkRateLimit(identifier: string): { isLocked: boolean; remainingLockSeconds: number; failedAttempts: number } {
  if (!identifier) {
    return { isLocked: false, remainingLockSeconds: 0, failedAttempts: 0 }
  }

  const now = Date.now()
  const record = attemptsMap.get(identifier)

  if (!record) {
    return { isLocked: false, remainingLockSeconds: 0, failedAttempts: 0 }
  }

  if (record.lockedUntil > now) {
    const remainingLockSeconds = Math.ceil((record.lockedUntil - now) / 1000)
    return { isLocked: true, remainingLockSeconds, failedAttempts: record.failedAttempts }
  }

  // If lock period has expired and no attempts in the last 15 minutes, purge
  if (now - record.lastAttempt > 15 * 60 * 1000) {
    attemptsMap.delete(identifier)
    return { isLocked: false, remainingLockSeconds: 0, failedAttempts: 0 }
  }

  return { isLocked: false, remainingLockSeconds: 0, failedAttempts: record.failedAttempts }
}

/**
 * Record a failed attempt. If failedAttempts >= maxAttempts, locks out for lockDurationSeconds.
 */
export function recordFailedAttempt(
  identifier: string,
  maxAttempts: number = 5,
  lockDurationSeconds: number = 15 * 60
): RateLimitRecord {
  if (!identifier) {
    return { failedAttempts: 0, lockedUntil: 0, lastAttempt: Date.now() }
  }

  const now = Date.now()
  const record = attemptsMap.get(identifier) || {
    failedAttempts: 0,
    lockedUntil: 0,
    lastAttempt: now
  }

  record.failedAttempts += 1
  record.lastAttempt = now

  if (record.failedAttempts >= maxAttempts) {
    record.lockedUntil = now + lockDurationSeconds * 1000
  }

  attemptsMap.set(identifier, record)
  return record
}

/**
 * Reset failed attempts on successful authentication.
 */
export function resetRateLimit(identifier: string): void {
  if (identifier) {
    attemptsMap.delete(identifier)
  }
}

export const clearFailedAttempts = resetRateLimit

/**
 * Retrieve all currently active rate-limit locks.
 */
export function getActiveRateLimits(): Array<{
  identifier: string
  failedAttempts: number
  remainingLockSeconds: number
  lockedUntil: number
  lastAttempt: number
}> {
  const now = Date.now()
  const list = []
  for (const [key, record] of attemptsMap.entries()) {
    if (record.lockedUntil > now) {
      list.push({
        identifier: key,
        failedAttempts: record.failedAttempts,
        remainingLockSeconds: Math.ceil((record.lockedUntil - now) / 1000),
        lockedUntil: record.lockedUntil,
        lastAttempt: record.lastAttempt
      })
    }
  }
  return list
}

export function clearAllRateLimits(): void {
  attemptsMap.clear()
}

