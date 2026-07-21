import { dbGetUsers } from '../../utils/db'
import { validateSession, SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  try {
    return await dbGetUsers(event)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return []
  }
})
