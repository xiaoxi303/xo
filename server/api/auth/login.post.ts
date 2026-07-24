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

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码。' })
  }

  const config = await dbGetSiteConfig(event)
  const allowedUsername = config.admin?.username || 'admin'
  const allowedPasswordHash = config.admin?.passwordHash || ADMIN_PASSWORD_HASH

  if (username !== allowedUsername || !verifyPassword(password, allowedPasswordHash)) {
    logSecurityEvent({
      type: 'Token Session Guard',
      ip,
      action: `Failed admin login for username "${username}"`,
      status: 'blocked'
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误。' })
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
