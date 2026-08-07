import { dbGetProjectsRaw, dbGetProjectPassword, dbCreatePasswordRequest, getD1Database } from '../../../utils/db'
import { getRuntimeDataPath } from '../../../utils/storage'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../../utils/auth'
import { getDailyPassword } from '../../../utils/password-utils'
import { sendApprovalEmail } from '../../../utils/email'
import { dbGetUsers } from '../../../utils/db'
import { assertDeliveryAccess, normalizeDeliverySlug } from '../../../utils/delivery-access'
import fs from 'node:fs'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Please login first.' })
  }
  const session = validateSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Session expired, please login again.' })
  }

  const slug = normalizeDeliverySlug(event.context.params?.slug)
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project slug.' })
  }

  // Always use dynamic password based on slug
  let password = getDailyPassword(slug)

  // Get project title for logging
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find(p => p.slug === slug)
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found.' })
  }

  // A logged-in client may only request a delivery password for an assigned
  // project. The helper keeps anonymous/public project behavior unchanged,
  // while recording and escalating unauthorized client attempts.
  await assertDeliveryAccess(event, slug)
  const projectTitle = project ? project.title : slug

  // Get real client IP (same logic as booking.post.ts)
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) ip = cfConnectingIp.trim()
  else if (xRealIp) ip = xRealIp.trim()
  else if (xForwardedFor) ip = xForwardedFor.split(',')[0]?.trim() || ''
  if (!ip) ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

  // Detect device type
  const userAgent = getHeader(event, 'user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
  const deviceType = isMobile ? 'Mobile' : 'PC'

  // Look up user email from database
  let clientEmail = ''
  try {
    const users = await dbGetUsers(event)
    const user = users.find((u: any) => u.username === session.username)
    if (user) {
      clientEmail = user.email || ''
    }
  } catch (e) {
    console.error('Failed to lookup user email:', e)
  }

  // Format contact: email + IP
  const emailPart = clientEmail || session.username || 'unknown'
  const contactLabel = emailPart.includes('@') ? `邮箱: ${emailPart}` : emailPart
  const finalContact = `${contactLabel} | IP: ${ip} (${deviceType})`

  console.log('[get-password-direct] clientEmail:', clientEmail)
  console.log('[get-password-direct] Real IP:', ip)
  console.log('[get-password-direct] finalContact:', finalContact)

  const reqObj = {
    clientName: 'Direct Access (' + session.username + ')',
    contact: finalContact,
    projectSlug: slug,
    projectTitle: projectTitle,
    clientUsername: session.username,
    clientEmail,
    ip,
    deviceType,
    status: 'approved'
  }

  await dbCreatePasswordRequest(event, reqObj)

  // Send email notification
  if (clientEmail) {
    sendApprovalEmail(event, reqObj).catch(err => {
      console.error('Failed to send direct access email:', err)
    })
  }

  return { password }
})
