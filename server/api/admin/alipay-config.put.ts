import { getCookie, readBody, createError, defineEventHandler } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { publicStripeConfig, saveStripeConfig } from '../../utils/stripe'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权的后台请求' })
  const body = (event.context.decryptedBody || await readBody(event).catch(() => ({}))) as any

  const patch: any = {
    enabled: Boolean(body.enabled)
  }
  if (body.appId) patch.publishableKey = String(body.appId).trim()
  if (body.publishableKey) patch.publishableKey = String(body.publishableKey).trim()
  if (body.privateKey) patch.secretKey = String(body.privateKey).trim()
  if (body.secretKey) patch.secretKey = String(body.secretKey).trim()
  if (body.alipayPublicKey) patch.webhookSecret = String(body.alipayPublicKey).trim()
  if (body.webhookSecret) patch.webhookSecret = String(body.webhookSecret).trim()
  if (body.notifyUrl) patch.successUrl = String(body.notifyUrl).trim()
  if (body.returnUrl) patch.cancelUrl = String(body.returnUrl).trim()
  if (body.subjectPrefix) patch.subjectPrefix = String(body.subjectPrefix).trim()

  const saved = saveStripeConfig(patch)
  const stripe = publicStripeConfig(saved)

  return {
    success: true,
    config: {
      enabled: stripe.enabled,
      appId: stripe.publishableKey,
      gateway: 'https://api.stripe.com/v1/checkout/sessions',
      notifyUrl: stripe.successUrl,
      returnUrl: stripe.cancelUrl,
      subjectPrefix: stripe.subjectPrefix,
      hasPrivateKey: stripe.hasSecretKey,
      hasAlipayPublicKey: stripe.hasWebhookSecret
    }
  }
})
