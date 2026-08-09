import { dbGetSiteConfig, dbSaveSiteConfig, getD1Database } from '../utils/db'
import { validateSession, SESSION_COOKIE } from '../utils/auth'

function publicSiteConfig(config: any) {
  if (!config || typeof config !== 'object') return {}
  const copy = JSON.parse(JSON.stringify(config))
  if (copy.admin) {
    delete copy.admin.passwordHash
    delete copy.admin.newPassword
  }
  if (copy.emailSettings) {
    delete copy.emailSettings.smtpPass
  }
  if (copy.aiSettings) {
    delete copy.aiSettings.apiKey
  }
  if (copy.watermark) {
    delete copy.watermark.extractPassword
  }
  return copy
}

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const token = getCookie(event, SESSION_COOKIE)
    return token && validateSession(token)
      ? await dbGetSiteConfig(event)
      : publicSiteConfig(await dbGetSiteConfig(event))
  }

  if (method === 'PUT') {
    // Authentication check (admin session only)
    const token = getCookie(event, SESSION_COOKIE)
    if (!token || !validateSession(token)) {
      throw createError({ statusCode: 401, statusMessage: '未经授权的修改操作，请先登录管理员。' })
    }

    const db = await getD1Database(event)

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
