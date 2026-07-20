/**
 * GET /api/auth/me
 * Returns the current authenticated user info, or 401 if not logged in.
 */
import { validateSession, SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) throw createError({ statusCode: 401, statusMessage: '未登录。' })

  const session = validateSession(token)
  if (!session) throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })

  return { username: session.username, createdAt: session.createdAt }
})
