import { validateSession, SESSION_COOKIE } from '../utils/auth'
import { logSecurityEvent } from '../utils/security-logger'
import { getRealClientIP } from '../utils/ip-helper'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const method = event.method

  if (
    url.pathname.includes('/unlock') ||
    url.pathname.includes('/get-password-direct') ||
    url.pathname.endsWith('/view')
  ) {
    return
  }

  const isAdminRoute =
    url.pathname.startsWith('/api/projects') ||
    url.pathname.startsWith('/api/site-config')

  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
  if (!isAdminRoute || !isMutation) return

  const ip = getRealClientIP(event)
  const token = getCookie(event, SESSION_COOKIE)

  if (!token) {
    logSecurityEvent({
      type: 'Token Session Guard',
      ip,
      action: `Missing admin session token for ${method} ${url.pathname}`,
      status: 'blocked'
    })
    throw createError({ statusCode: 401, statusMessage: '请先登录后台管理。' })
  }

  const session = validateSession(token)
  if (!session) {
    logSecurityEvent({
      type: 'Token Session Guard',
      ip,
      action: `Expired or invalid admin session token for ${method} ${url.pathname}`,
      status: 'blocked'
    })
    throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })
  }
})
