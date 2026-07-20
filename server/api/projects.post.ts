import { dbCreateProject, getD1Database } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.slug || !body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug and Title are required.'
    })
  }

  // Check if we are running on Cloudflare with D1 database
  const db = await getD1Database(event)
  
  if (!db && process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      statusMessage: 'For safety, editing local Markdown is disabled in production.'
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
