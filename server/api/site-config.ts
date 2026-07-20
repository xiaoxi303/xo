import { dbGetSiteConfig, dbSaveSiteConfig, getD1Database } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    return await dbGetSiteConfig(event)
  }

  if (method === 'PUT') {
    // Check if D1 DB binding is available on Cloudflare
    const db = await getD1Database(event)
    if (!db && process.env.NODE_ENV === 'production') {
      throw createError({ statusCode: 403, statusMessage: 'Editing config is disabled in production.' })
    }

    try {
      const body = await readBody(event)
      await dbSaveSiteConfig(event, body)
      return { success: true }
    } catch (error) {
      console.error('Failed to save config:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to save config.' })
    }
  }
})
