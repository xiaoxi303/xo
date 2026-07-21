import { dbCreateProject, getD1Database } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.slug || !body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug and Title are required.'
    })
  }

  if (!body.image?.trim() && !body.videoUrl?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: '请至少填写封面图片 URL 或视频 MP4 URL。'
    })
  }

  // Check if we are running on Cloudflare with D1 database
  const db = await getD1Database(event)
  const isCloudflare = !!event.context.cloudflare
  
  if (!db && isCloudflare) {
    throw createError({
      statusCode: 403,
      statusMessage: 'For safety, editing local Markdown is disabled in production on Cloudflare Pages.'
    })
  }

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
