import {
  ADMIN_PASSWORD_HASH,
  createSession,
  getSessionInfo,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
  verifyPassword
} from '../../utils/auth'
import { dbGetSiteConfig } from '../../utils/db'
import { logSecurityEvent } from '../../utils/security-logger'
import { getRealClientIP } from '../../utils/ip-helper'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}
  const ip = getRealClientIP(event)

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码。' })
  }

  const config = await dbGetSiteConfig(event)
  const allowedUsername = process.env.XO_ADMIN_USERNAME || config.admin?.username || ADMIN_USERNAME
  const allowedPasswordHash = process.env.XO_ADMIN_PASSWORD_HASH || config.admin?.passwordHash || ADMIN_PASSWORD_HASH

  // Check username first
  if (username !== allowedUsername) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Login attempt for non-existent admin "${username}"`,
      status: 'warning'
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    throw createError({ statusCode: 404, statusMessage: '该管理账户不存在。' })
  }
  
  // Then check password
  if (!verifyPassword(password, allowedPasswordHash)) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Wrong password for admin "${username}"`,
      status: 'blocked'
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '管理员密码错误。' })
  }

  const token = createSession(username)
  setCookie(event, SESSION_COOKIE, token, SESSION_COOKIE_OPTS)

  const session = getSessionInfo(token)

  logSecurityEvent({
    type: 'Admin Access Gate',
    ip,
    action: `Admin session issued for "${username}"`,
    status: 'success'
  })

  return {
    success: true,
    username,
    expiresAt: session?.expiresAt || 0,
    remainingSeconds: session?.remainingSeconds || 0
  }
})
