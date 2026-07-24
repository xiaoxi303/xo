import { getSessionInfo, SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) throw createError({ statusCode: 401, statusMessage: '未登录。' })

  const session = getSessionInfo(token)
  if (!session) throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })

  return {
    username: session.username,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    remainingSeconds: session.remainingSeconds
  }
})
