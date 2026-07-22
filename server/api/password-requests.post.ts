import { dbCreatePasswordRequest, dbCheckRateLimitAndBlacklist } from '../utils/db'
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

  // Retrieve client username if logged in
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username
    }
  }

  // Extract client IP
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) ip = cfConnectingIp.trim()
  else if (xRealIp) ip = xRealIp.trim()
  else if (xForwardedFor) ip = xForwardedFor.split(',')[0]?.trim() || ''
  if (!ip) ip = getRequestIP(event, { xForwardedFor: true }) || '未知 IP'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

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
    clientUsername,
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
