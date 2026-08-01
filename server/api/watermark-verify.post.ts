import { dbGetSiteConfig } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const siteConfig = await dbGetSiteConfig(event)
  const configuredPassword = siteConfig?.watermark?.extractPassword || ''

  // Action: Check if extraction password has been set in admin
  if (body?.action === 'check') {
    return {
      isPasswordSet: !!configuredPassword && configuredPassword.trim().length > 0
    }
  }

  // Action: Verify user input password
  if (body?.action === 'verify') {
    if (!configuredPassword || configuredPassword.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '您尚未在后台设置提取密码，请先前往后台设置密码。'
      })
    }

    const inputPassword = (body?.password || '').trim()
    const isValid = inputPassword === configuredPassword.trim()

    if (!isValid) {
      throw createError({
        statusCode: 401,
        statusMessage: '提取密码错误，请重新输入。'
      })
    }

    return {
      success: true,
      watermarkInfo: {
        invisibleText: siteConfig?.watermark?.invisibleText || '© Xo Studio 2026',
        invisibleOpacity: siteConfig?.watermark?.invisibleOpacity ?? 3
      }
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: '无效的验证请求操作。'
  })
})
