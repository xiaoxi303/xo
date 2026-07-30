import { dbCreateProject, getD1Database } from '../utils/db'
import { validateSession, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求，请先登录管理员。' })
  }

  const body = await readBody(event)

  if (!body.slug || !body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug and Title are required.'
    })
  }

  const hasVideo = body.videoUrl?.trim() || (Array.isArray(body.videoUrls) && body.videoUrls.some((url: string) => url?.trim()))
  if (!body.image?.trim() && !hasVideo) {
    throw createError({
      statusCode: 400,
      statusMessage: '请至少填写封面图片 URL 或视频 MP4 URL。'
    })
  }

  const db = await getD1Database(event)

  try {
    await dbCreateProject(event, body)
    return { success: true, slug: body.slug }
  } catch (error: any) {
    console.error('Failed to create project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error writing project.'
    })
  }
})
