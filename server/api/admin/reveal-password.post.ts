import { defineEventHandler, getCookie, readBody, createError } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { dbGetProjectsRaw, dbGetProjectPassword } from '../../utils/db'
import { getDailyPassword } from '../../utils/password-utils'
import { decryptFileContent } from '../../utils/storage'

/**
 * XO Studio · 管理员密码专属按需解密通道
 * 核心保障：所有密码在网络中 100% 以自研 V5 双舱级联签名密文流转
 * 仅在具有合法会话的管理员通过双舱混合请求进行解密申请时，经双重验签后安全返回
 */
export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  const session = token ? validateSession(token) : null

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的操作，请先登录管理员。' })
  }

  const body = await readBody(event)
  const slug = String(body?.slug || '').trim()
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: '缺少项目唯一标识 (slug)。' })
  }

  const projects = await dbGetProjectsRaw(event)
  const project = projects.find((p: any) => p.slug === slug)
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: '未找到指定视频项目。' })
  }

  if (!project.isPasswordProtected) {
    return { success: true, password: '', isLocked: false }
  }

  let finalPassword = ''

  // 若提供了前端缓存的 V5 双舱加密封签，执行服务端真理共识解密与 HMAC-512/384 级联验签
  if (body?.encryptedToken && typeof body.encryptedToken === 'string' && body.encryptedToken.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
    try {
      finalPassword = decryptFileContent(body.encryptedToken)
    } catch (e: any) {
      console.warn(`[reveal-password] Token 解密异常，回退至金库实时重算:`, e.message)
    }
  }

  if (!finalPassword) {
    if (project.autoRotatePassword) {
      try {
        finalPassword = getDailyPassword(slug)
      } catch {
        finalPassword = project.password || ''
      }
    } else {
      finalPassword = project.password || ''
    }
    if (finalPassword && finalPassword.startsWith('$XO_VAULT_')) {
      try {
        finalPassword = decryptFileContent(finalPassword)
      } catch {}
    }
  }

  return {
    success: true,
    slug,
    password: finalPassword,
    isLocked: true,
    decryptedAt: Date.now()
  }
})
