import { getRouterParam } from 'h3'
import {
  dbGetUserByDeliverySuffix,
  dbGetUserRecord,
  dbGetUsers,
  dbRecordDeliveryWarning,
  verifyDeliveryKey,
  dbGetProjectsRaw
} from '../../../utils/db'
import {
  CLIENT_SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
  createSession,
  destroySession,
  getSessionInfo
} from '../../../utils/auth'
import { getRealClientIP } from '../../../utils/ip-helper'
import { logSecurityEvent } from '../../../utils/security-logger'
import { getDailyPassword } from '../../../utils/password-utils'
import { getDeliveryItemsBySuffix } from '../../../utils/delivery-items'

function cleanSuffix(value: unknown) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
}

function readAllowedProjects(user: any) {
  if (Array.isArray(user?.allowedProjects)) {
    return new Set(user.allowedProjects.map((item: any) => String(item || '').trim()).filter(Boolean))
  }

  const raw = String(user?.allowedProjects || '').trim()
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((item: any) => String(item || '').trim()).filter(Boolean))
      }
    } catch {}
  }

  return new Set(
    raw
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean)
  )
}

function publicProject(project: any) {
  return {
    slug: project.slug,
    title: project.title,
    image: project.image || '',
    description: project.description || '',
    releaseYear: project.releaseYear || '',
    deliverFormat: project.deliverFormat || '',
    isPasswordProtected: Boolean(project.isPasswordProtected)
  }
}

export default defineEventHandler(async (event) => {
  const suffix = cleanSuffix(getRouterParam(event, 'suffix'))
  if (!suffix) {
    throw createError({ statusCode: 400, statusMessage: '缺少交付入口后缀。' })
  }

  const body = await readBody(event).catch(() => ({})) as any
  const key = String(body?.key || body?.deliveryKey || '').trim()
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: '请输入专属查看密钥。' })
  }

  // Backfill credentials for legacy users before resolving the suffix.
  await dbGetUsers(event)
  const target = await dbGetUserByDeliverySuffix(event, suffix)
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: '交付入口不存在或已失效。' })
  }
  if (target.isBlacklisted) {
    throw createError({ statusCode: 403, statusMessage: '该交付入口已被停用。' })
  }

  const currentToken = getCookie(event, CLIENT_SESSION_COOKIE)
  const currentSession = currentToken ? getSessionInfo(currentToken) : null
  const currentUsername = currentSession?.username || ''

  // A logged-in customer attempting another customer's suffix is a scoped security event.
  if (currentUsername && currentUsername.toLowerCase() !== String(target.username || '').toLowerCase()) {
    const violation = await dbRecordDeliveryWarning(
      event,
      currentUsername,
      `尝试访问客户 ${target.username} 的专属交付入口`,
      2
    )
    logSecurityEvent({
      type: 'Delivery Scope Guard',
      ip: getRealClientIP(event),
      action: `${currentUsername} attempted delivery suffix ${suffix}`,
      status: violation.isBlacklisted ? 'blocked' : 'warning'
    })

    if (violation.isBlacklisted) {
      if (currentToken) destroySession(currentToken)
      setCookie(event, CLIENT_SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTS, maxAge: -1 })
      throw createError({
        statusCode: 423,
        statusMessage: '检测到再次越权访问，账号已被拉黑，已支付费用不予退还。'
      })
    }

    throw createError({
      statusCode: 403,
      statusMessage: '这是其他客户的专属交付入口。首次越权访问已记录警告，请返回自己的入口。'
    })
  }

  if (!verifyDeliveryKey(target, key)) {
    logSecurityEvent({
      type: 'Delivery Key Guard',
      ip: getRealClientIP(event),
      action: `Invalid delivery key for suffix ${suffix}`,
      status: 'blocked'
    })
    throw createError({ statusCode: 401, statusMessage: '查看密钥不正确。' })
  }

  // A delivery key authenticates the client for the duration of the normal client session.
  const sessionToken = createSession(target.username)
  setCookie(event, CLIENT_SESSION_COOKIE, sessionToken, SESSION_COOKIE_OPTS)

  const allowedProjects = getDeliveryItemsBySuffix(suffix).map(item => ({
    slug: item.id,
    title: item.title,
    image: item.poster,
    description: item.description,
    videoUrl: item.videoUrl,
    deliveryOnly: true
  }))

  return {
    success: true,
    username: target.username,
    suffix,
    projects: allowedProjects,
    rules: {
      scope: '仅显示当前客户已授权的项目',
      warning: '首次访问他人入口会记录警告，再次违规将拉黑账号',
      refund: '违规封禁后已支付费用不予退还'
    }
  }
})
