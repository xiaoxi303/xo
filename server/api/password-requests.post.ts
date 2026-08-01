import { dbCreatePasswordRequest, dbCheckRateLimitAndBlacklist, getD1Database } from '../utils/db'
import fs from 'node:fs'
import { getRuntimeDataPath } from '../utils/storage'
import { validateSession, CLIENT_SESSION_COOKIE } from '../utils/auth'
import { sendApprovalEmail } from '../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.projectSlug || !body.projectTitle) {
    throw createError({
      statusCode: 400,
      statusMessage: '项目信息为必填项。'
    })
  }

  // 1. Get current logged-in user from session
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  let clientEmail = ''
  
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username || ''
      // Look up user email from database
      try {
        const db = await getD1Database(event)
        if (db) {
          const user = await db.prepare('SELECT email FROM users WHERE username = ?').bind(clientUsername).first() as any
          clientEmail = user?.email || ''
        } else {
          const usersPath = getRuntimeDataPath('users.json')
          if (fs.existsSync(usersPath)) {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
            const user = users.find((u: any) => u.username === clientUsername)
            clientEmail = user?.email || ''
          }
        }
      } catch (e) {
        console.error('[password-requests] Failed to look up user email:', e)
      }
    }
  }

  // 2. Extract real client IP (EXACT same logic as booking.post.ts)
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) ip = cfConnectingIp.trim()
  else if (xRealIp) ip = xRealIp.trim()
  else if (xForwardedFor) ip = xForwardedFor.split(',')[0]?.trim() || ''
  if (!ip) ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

  // Debug log
  console.log('[password-requests] clientUsername:', clientUsername)
  console.log('[password-requests] clientEmail:', clientEmail)
  console.log('[password-requests] body.contact:', body.contact)
  console.log('[password-requests] Real IP:', ip)

  // 3. Detect device type
  const userAgent = getHeader(event, 'user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
  const deviceType = isMobile ? 'Mobile' : 'PC'

  // 4. Build final contact string
  // Priority: body.contact (from frontend) -> clientEmail (from DB) -> username
  const emailPart = body.contact || clientEmail || clientUsername || 'unknown'
  const finalContact = `${emailPart} | IP: ${ip} (${deviceType})`

  console.log('[password-requests] finalContact:', finalContact)

  // 5. Rate-limit and blacklist check
  const check = await dbCheckRateLimitAndBlacklist(event, {
    username: clientUsername,
    contact: body.contact,
    ip
  })

  // 6. Determine status
  let status = 'approved'
  let reason = check.isWhitelisted ? '白名单客户自动通过' : '防刷校验通过，系统自动授权'

  if (check.isBlacklisted) {
    status = 'pending'
    reason = check.reason || '已被系统防刷保护或黑名单拦截，需管理员手动审核'
  }

  // 7. Build request data with formatted contact
  const requestData = {
    clientName: body.clientName || clientUsername || 'Direct Access',
    contact: finalContact,
    projectSlug: body.projectSlug,
    projectTitle: body.projectTitle,
    reason: body.reason || '',
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
