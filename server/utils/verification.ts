export interface VerificationRecord {
  code: string
  expiresAt: number
  lastSentAt: number
}

// In-memory store for email verification codes
const verificationStore = new Map<string, VerificationRecord>()

// Clean up expired codes periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [email, record] of verificationStore.entries()) {
      if (now > record.expiresAt) {
        verificationStore.delete(email)
      }
    }
  }, 5 * 60 * 1000)
}

/**
 * Generate a random 6-digit verification code string
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Get remaining cooldown seconds before a new code can be sent to this email
 */
export function getCooldownRemaining(email: string, cooldownSeconds = 60): number {
  const normalizedEmail = email.trim().toLowerCase()
  const record = verificationStore.get(normalizedEmail)
  if (!record) return 0

  const elapsed = Math.floor((Date.now() - record.lastSentAt) / 1000)
  const remaining = cooldownSeconds - elapsed
  return remaining > 0 ? remaining : 0
}

/**
 * Store a new verification code for an email (valid for ttlSeconds, default 60s)
 */
export function storeVerificationCode(email: string, code: string, ttlSeconds = 60): void {
  const normalizedEmail = email.trim().toLowerCase()
  const now = Date.now()
  verificationStore.set(normalizedEmail, {
    code,
    expiresAt: now + ttlSeconds * 1000,
    lastSentAt: now
  })
}

/**
 * Verify code for an email and consume it if valid
 */
export function verifyAndConsumeCode(email: string, inputCode: string): { success: boolean; message?: string } {
  const normalizedEmail = email.trim().toLowerCase()
  const record = verificationStore.get(normalizedEmail)

  if (!record) {
    return { success: false, message: '请先获取验证码。' }
  }

  if (Date.now() > record.expiresAt) {
    verificationStore.delete(normalizedEmail)
    return { success: false, message: '验证码已超时失效，请重新获取。' }
  }

  if (record.code !== inputCode.trim()) {
    return { success: false, message: '验证码不正确，请重新输入。' }
  }

  // Code is valid! Consume it so it cannot be reused.
  verificationStore.delete(normalizedEmail)
  return { success: true }
}
