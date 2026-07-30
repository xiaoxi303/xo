import { dbDeleteProject, getD1Database } from '../utils/db'
import { validateSession, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求，请先登录管理员。' })
  }

  const query = getQuery(event)
  const slug = query.slug as string
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required.'
    })
  }

  const db = await getD1Database(event)

  try {
    await dbDeleteProject(event, slug)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error deleting project.'
    })
  }
})
