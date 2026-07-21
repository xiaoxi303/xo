import { dbDeletePasswordRequest } from '../utils/db'
import { validateSession, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const query = getQuery(event)
  const id = query.id as string

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少请求 ID。'
    })
  }

  try {
    await dbDeletePasswordRequest(event, id)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete password request:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '删除记录失败。'
    })
  }
})
