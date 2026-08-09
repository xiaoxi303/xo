import fs from 'node:fs'
import { defineEventHandler, readBody } from 'h3'
import { getRuntimeDataPath } from '../utils/storage'
import { logSecurityEvent } from '../utils/security-logger'
import { decryptRsaHybrid, isRsaHybridPayload } from '../utils/rsa-hybrid'

export default defineEventHandler(async (event) => {
  let body = await readBody(event)
  if (isRsaHybridPayload(body)) {
    try {
      body = JSON.parse(decryptRsaHybrid(body))
    } catch (error: any) {
      throw createError({ statusCode: 400, statusMessage: error?.message || 'RSA 请求解密失败' })
    }
  }
  const { name, phone, email, company, serviceType, budget, timeline, description, referenceLinks } = body || {}

  // Validation
  if (!name || !phone || !email || !serviceType || !description) {
    throw createError({ statusCode: 400, statusMessage: '请填写必填项目' })
  }

  // Get real client IP (support various proxy headers)
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) ip = cfConnectingIp.trim()
  else if (xRealIp) ip = xRealIp.trim()
  else if (xForwardedFor) ip = xForwardedFor.split(',')[0]?.trim() || ''
  if (!ip) ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1 (本地)'

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
