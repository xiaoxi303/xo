import { dbGetSiteConfig, dbSaveSiteConfig, getD1Database } from '../utils/db'

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    return await dbGetSiteConfig(event)
  }

  if (method === 'PUT') {
    // Check if D1 DB binding is available on Cloudflare
    const db = await getD1Database(event)
    const isCloudflare = !!event.context.cloudflare
    if (!db && isCloudflare) {
      throw createError({ statusCode: 403, statusMessage: 'Editing config is disabled in production on Cloudflare Pages without D1.' })
    }

    try {
      const body = await readBody(event)

      // Handle administrator credential updates securely
      if (body.admin) {
        if (body.admin.newPassword && body.admin.newPassword.trim() !== '') {
          const createHash = await import('crypto').then(m => m.createHash)
          const plain = body.admin.newPassword
          const hashed = createHash('sha256').update(`xo-studio:${plain}`).digest('hex')
          body.admin.passwordHash = hashed
        }
        delete body.admin.newPassword
      }

      await dbSaveSiteConfig(event, body)
      return { success: true }
    } catch (error) {
      console.error('Failed to save config:', error)
      throw createError({ statusCode: 500, statusMessage: 'Failed to save config.' })
    }
  }
})
