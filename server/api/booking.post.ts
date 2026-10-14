import fs from 'node:fs'
import { defineEventHandler, readBody, getCookie } from 'h3'
import { getRuntimeDataPath } from '../utils/storage'
import { logSecurityEvent } from '../utils/security-logger'
import { decryptRsaHybrid, isRsaHybridPayload } from '../utils/rsa-hybrid'
import { decryptE2EE, isE2EEPayload } from '../utils/e2ee'
import { validateSession, CLIENT_SESSION_COOKIE } from '../utils/auth'
import { getRealClientIP } from '../utils/ip-helper'
import { checkRateLimit, recordFailedAttempt } from '../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)

  // Rate limiting to prevent spam / malicious garbage bookings
  const ipLock = checkRateLimit(`booking-ip:${ip}`)
  if (ipLock.isLocked) {
    setResponseHeader(event, 'Retry-After', String(ipLock.remainingLockSeconds))
    throw createError({
      statusCode: 429,
      statusMessage: `预约提交过于频繁，请等待 ${ipLock.remainingLockSeconds} 秒后再试。`
    })
  }

  let body = await readBody(event)

  // Strict Encryption Enforcement: Reject unencrypted booking submissions
  if (!isRsaHybridPayload(body) && !isE2EEPayload(body)) {
    recordFailedAttempt(`booking-ip:${ip}`, 5, 15 * 60)
    throw createError({
      statusCode: 400,
      statusMessage: '安全策略强制要求端到端/RSA加密传输，明文提交已被拦截拒绝。'
    })
  }

  if (isRsaHybridPayload(body)) {
    try {
      body = JSON.parse(decryptRsaHybrid(body))
    } catch (error: any) {
      throw createError({ statusCode: 400, statusMessage: error?.message || 'RSA 请求解密失败' })
    }
  } else if (isE2EEPayload(body)) {
    try {
      body = JSON.parse(decryptE2EE(body))
    } catch (error: any) {
      throw createError({ statusCode: 400, statusMessage: 'E2EE 解密失败：数据损坏或被篡改' })
    }
  }
  const { name, phone, email, company, serviceType, budget, timeline, description, referenceLinks } = body || {}

  // Validation
  if (!name || !phone || !email || !serviceType || !description) {
    throw createError({ statusCode: 400, statusMessage: '请填写必填项目' })
  }

  // Client IP is already verified above via getRealClientIP

  const clientToken = getCookie(event, CLIENT_SESSION_COOKIE)
  let loggedInClientUsername = ''
  if (clientToken) {
    const session = validateSession(clientToken)
    if (session?.username) {
      loggedInClientUsername = session.username
    }
  }

  const booking = {
    id: `BK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    phone,
    email,
    company: company || '',
    serviceType,
    budget: budget || '',
    timeline: timeline || '',
    description,
    referenceLinks: referenceLinks || '',
    status: 'pending',
    clientUsername: loggedInClientUsername || '',
    ip,
    createdAt: new Date().toISOString()
  }

  // Save to file
  const bookingsPath = getRuntimeDataPath('bookings.json')
  let bookings: any[] = []
  
  try {
    if (fs.existsSync(bookingsPath)) {
      bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'))
    }
  } catch {
    bookings = []
  }

  bookings.unshift(booking)
  
  // Keep only last 100 bookings
  if (bookings.length > 100) {
    bookings = bookings.slice(0, 100)
  }

  fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2), 'utf-8')

  // Log security event
  logSecurityEvent({
    type: 'Booking',
    ip,
    action: `New booking from "${name}" for ${serviceType}`,
    status: 'success'
  })

  return { success: true, id: booking.id }
})
