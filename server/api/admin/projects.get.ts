import { dbGetProjectsRaw } from '../../utils/db'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  const session = token ? validateSession(token) : null

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '请先登录后台管理。' })
  }

  try {
    return await dbGetProjectsRaw(event)
  } catch (error) {
    console.error('Failed to read admin projects:', error)
    throw createError({ statusCode: 500, statusMessage: '读取后台作品列表失败。' })
  }
})
