import fs from 'node:fs'
import { defineEventHandler, readBody } from 'h3'
import { getRuntimeDataPath } from '../../utils/storage'
import { logSecurityEvent } from '../../utils/security-logger'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, phone, email, company, serviceType, budget, timeline, description, referenceLinks } = body || {}

  // Validation
  if (!name || !phone || !email || !serviceType || !description) {
    throw createError({ statusCode: 400, statusMessage: '请填写必填项目' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

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
