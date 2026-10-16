import fs from 'node:fs'
import { defineEventHandler, readBody, getCookie } from 'h3'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from '../utils/storage'
import { logSecurityEvent } from '../utils/security-logger'
import { decryptRsaHybrid, isRsaHybridPayload } from '../utils/vault-cipher'
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
  if (!event.context.hybridDecrypted) {
    if (!isRsaHybridPayload(body)) {
      recordFailedAttempt(`booking-ip:${ip}`, 5, 15 * 60)
      throw createError({
        statusCode: 400,
        statusMessage: '安全策略拦截：仅支持金库双舱混淆共识加密传输。'
      })
    }

    try {
      body = JSON.parse(await decryptRsaHybrid(body, event))
    } catch {
      throw createError({ statusCode: 400, statusMessage: '安全策略拦截：请求未通过金库共识解密校验。' })
    }
  }

  const { name, phone, email, company, serviceType, budget, timeline, description, referenceLinks } = body || {}

  // 1. Basic presence check
  if (!name || !phone || !email || !serviceType || !description) {
    throw createError({ statusCode: 400, statusMessage: '请填写必填项目。' })
  }

  // 2. Strict Input Sanitization & Length Bounds (Prevent Buffer Exhaustion & Stored XSS)
  const cleanName = String(name).trim().slice(0, 60)
  const cleanPhone = String(phone).trim().slice(0, 30)
  const cleanEmail = String(email).trim().toLowerCase().slice(0, 120)
  const cleanCompany = String(company || '').trim().slice(0, 100)
  const cleanServiceType = String(serviceType).trim().slice(0, 80)
  const cleanBudget = String(budget || '').trim().slice(0, 60)
  const cleanTimeline = String(timeline || '').trim().slice(0, 60)
  const cleanDescription = String(description).trim().slice(0, 3000)

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(cleanEmail)) {
    throw createError({ statusCode: 400, statusMessage: '请输入格式有效的联系邮箱。' })
  }

  // Strictly enforce safe URL scheme for reference links (Block javascript:, data:, vbscript:)
  let cleanReferenceLinks = ''
  if (referenceLinks && String(referenceLinks).trim()) {
    const rawLink = String(referenceLinks).trim().slice(0, 500)
    try {
      const parsedUrl = new URL(rawLink)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
      cleanReferenceLinks = parsedUrl.toString()
    } catch {
      throw createError({ statusCode: 400, statusMessage: '参考样片链接格式不安全，必须以 http:// 或 https:// 开头。' })
    }
  }

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
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    company: cleanCompany,
    serviceType: cleanServiceType,
    budget: cleanBudget,
    timeline: cleanTimeline,
    description: cleanDescription,
    referenceLinks: cleanReferenceLinks,
    status: 'pending',
    clientUsername: loggedInClientUsername || '',
    ip,
    createdAt: new Date().toISOString()
  }

  // Save to encrypted file
  const bookingsPath = getRuntimeDataPath('bookings.json')
  let bookings: any[] = readEncryptedJson<any[]>(bookingsPath, [])

  bookings.unshift(booking)

  // Keep only last 100 bookings
  if (bookings.length > 100) {
    bookings = bookings.slice(0, 100)
  }

  writeEncryptedJson(bookingsPath, bookings)

  // Throttle booking frequency: max 3 submissions per 10 minutes per IP
  recordFailedAttempt(`booking-ip:${ip}`, 3, 10 * 60)

  // Log security event
  logSecurityEvent({
    type: 'Booking',
    ip,
    action: `New booking from "${name}" for ${serviceType}`,
    status: 'success'
  })

  return { success: true, id: booking.id }
})
