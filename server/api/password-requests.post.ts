import { dbCreatePasswordRequest, dbCheckRateLimitAndBlacklist, getD1Database } from '../utils/db'
import fs from 'node:fs'
import { getRuntimeDataPath } from '../utils/storage'
import { validateSession, CLIENT_SESSION_COOKIE } from '../utils/auth'
import { sendApprovalEmail } from '../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.clientName || !body.contact || !body.projectSlug || !body.projectTitle) {
    throw createError({
      statusCode: 400,
      statusMessage: '客户姓名、联系方式、项目信息为必填项。'
    })
  }

  // Helper: detect device type from user-agent
  const getDeviceType = (ua: string): string => {
    if (!ua) return 'Unknown'
    const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone']
    return mobileKeywords.some(k => ua.includes(k)) ? 'Mobile' : 'PC'
  }

  // Retrieve client info if logged in
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  let clientEmail = ''
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username || ''
      // Look up user email from database
      const db = await getD1Database(event)
      if (db) {
        const user = await db.prepare('SELECT email FROM users WHERE username = ?').bind(clientUsername).first() as any
        clientEmail = user?.email || ''
      } else {
        const usersPath = getRuntimeDataPath('users.json')
        if (fs.existsSync(usersPath)) {
          try {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
            const user = users.find((u: any) => u.username === clientUsername)
            clientEmail = user?.email || ''
          } catch {}
        }
      }
    }
  }

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
  const deviceType = getDeviceType(userAgent)

  // Format contact string: use body.contact (auto-filled by frontend) + IP
  const contactParts = []
  // body.contact already contains the email from frontend auto-fill
  if (body.contact && !body.contact.startsWith('IP:')) {
    contactParts.push(body.contact)
  } else if (clientEmail) {
    contactParts.push(`邮箱: ${clientEmail}`)
  }
  contactParts.push(`IP: ${ip} (${deviceType})`)
  const formattedContact = contactParts.join(' | ') || body.contact

  // Perform rate-limit and blacklist / whitelist check
  const check = await dbCheckRateLimitAndBlacklist(event, {
    username: clientUsername,
    contact: body.contact,
    ip
  })

  // Determine status and reason
  let status = 'approved'
  let reason = check.isWhitelisted ? '白名单客户自动通过' : '防刷校验通过，系统自动授权'

  if (check.isBlacklisted) {
    status = 'pending'
    reason = check.reason || '已被系统防刷保护或黑名单拦截，需管理员手动审核'
  }

  const requestData = {
    ...body,
    contact: formattedContact,
    clientUsername,
    clientEmail,
    ip,
    deviceType,
    status,
    reason,
    isBlacklisted: check.isBlacklisted,
    isAutoBlacklisted: check.isAutoBlacklisted || false
  }

  try {
    await dbCreatePasswordRequest(event, requestData)

    // If auto-approved, send email notification automatically in background
    if (status === 'approved') {
      sendApprovalEmail(event, requestData).catch(err => {
        console.error('Failed to send auto-approval email:', err)
      })
    }

    return {
      success: true,
      autoApproved: status === 'approved',
      isBlacklisted: check.isBlacklisted,
      message: status === 'approved'
        ? '您的授权申请已秒级自动通过！解密凭证已发送至您的联系邮箱（如有填写）。'
        : '申请已提交。由于频繁申请或风控限制，需管理员手动审核后生效。'
    }
  } catch (error) {
    console.error('Failed to create password request:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '提交申请失败，请稍后重试。'
    })
  }
})
