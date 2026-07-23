import { dbDeleteProject, getD1Database } from '../utils/db'

export default defineEventHandler(async (event) => {
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
