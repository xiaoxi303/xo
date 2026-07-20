import { dbUpdateProject, getD1Database } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.slug || !body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug and Title are required.'
    })
  }

  const db = await getD1Database(event)
  const isCloudflare = !!event.context.cloudflare
  
  if (!db && isCloudflare) {
    throw createError({
      statusCode: 403,
      statusMessage: 'For safety, editing local Markdown is disabled in production on Cloudflare Pages.'
    })
  }

  try {
    await dbUpdateProject(event, body)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error updating project.'
    })
  }
})
