import { getCookie, readBody, createError, defineEventHandler } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { publicStripeConfig, saveStripeConfig, type StripeConfig } from '../../utils/stripe'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未授权的后台管理请求。' })
  }

  const body = (event.context.decryptedBody || await readBody(event).catch(() => ({}))) as any

  const enabled = Boolean(body.enabled)
  const publishableKey = String(body.publishableKey || '').trim()
  const secretKey = body.secretKey !== undefined ? String(body.secretKey).trim() : undefined
  const webhookSecret = body.webhookSecret !== undefined ? String(body.webhookSecret).trim() : undefined
  const currency = String(body.currency || 'cny').trim().toLowerCase()
  const successUrl = String(body.successUrl || '').trim()
  const cancelUrl = String(body.cancelUrl || '').trim()
  const subjectPrefix = String(body.subjectPrefix || 'XO Studio 订单').trim()

  const saved = saveStripeConfig({
    enabled,
    publishableKey,
    ...(secretKey ? { secretKey } : {}),
    ...(webhookSecret ? { webhookSecret } : {}),
    currency,
    successUrl,
    cancelUrl,
    subjectPrefix
  })

  return {
    success: true,
    config: publicStripeConfig(saved)
  }
})
