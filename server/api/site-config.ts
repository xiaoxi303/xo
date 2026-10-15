import { dbGetSiteConfig, dbSaveSiteConfig, getD1Database } from '../utils/db'
import { validateSession, SESSION_COOKIE, hashPassword } from '../utils/auth'

function publicSiteConfig(config: any) {
  if (!config || typeof config !== 'object') return {}
  const copy = JSON.parse(JSON.stringify(config))
  // Strict property stripping to prevent SSR hydration state leakage
  delete copy.admin
  delete copy.emailSettings
  delete copy.aiSettings
  if (copy.watermark) {
    delete copy.watermark.extractPassword
  }

  // 防爬虫邮件装甲：将对外展示邮箱在公网输出前进行异或混淆封装，源码不包含明文 @ 与域名
  if (copy.siteInfo && copy.siteInfo.contactEmail) {
    const rawEmail = String(copy.siteInfo.contactEmail).trim()
    if (rawEmail) {
      const xorBuf = Buffer.from(rawEmail, 'utf8').map(b => b ^ 0x7E)
      copy.siteInfo.contactEmailArmored = 'XO_ARMOR_' + xorBuf.toString('base64url')
      copy.siteInfo.contactEmail = 'protected'
    }
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
      const existing = await dbGetSiteConfig(event)

      // Handle administrator credential updates securely with PBKDF2-HMAC-SHA512
      if (body.admin) {
        if (body.admin.newPassword && body.admin.newPassword.trim() !== '') {
          body.admin.passwordHash = hashPassword(body.admin.newPassword.trim())
        } else if (!body.admin.passwordHash && existing?.admin?.passwordHash) {
          body.admin.passwordHash = existing.admin.passwordHash
        }
        delete body.admin.newPassword
      } else if (existing?.admin) {
        body.admin = existing.admin
      }

      // Preserve sensitive server settings if omitted from client payload
      if (!body.emailSettings && existing?.emailSettings) {
        body.emailSettings = existing.emailSettings
      }
      if (!body.aiSettings && existing?.aiSettings) {
        body.aiSettings = existing.aiSettings
      }

      // Preserve actual contactEmail if client sent masked string
      if (body.siteInfo) {
        if (body.siteInfo.contactEmail === 'protected' && existing?.siteInfo?.contactEmail) {
          body.siteInfo.contactEmail = existing.siteInfo.contactEmail
        }
        delete body.siteInfo.contactEmailArmored
      }

      await dbSaveSiteConfig(event, body)
      return { success: true }
    } catch (error: any) {
      console.error('Failed to save config:', error)
      throw createError({ statusCode: error.statusCode || 500, statusMessage: error.statusMessage || '保存配置失败。' })
    }
  }
})
