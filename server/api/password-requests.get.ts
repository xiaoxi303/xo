import { dbGetPasswordRequests } from '../utils/db'
import { validateSession, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check: only logged in admin can query the list
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  try {
    return await dbGetPasswordRequests(event)
  } catch (error) {
    console.error('Failed to get password requests:', error)
    return []
  }
})
