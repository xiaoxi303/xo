import { getCookie, createError, defineEventHandler } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { publicStripeConfig, readStripeConfig } from '../../utils/stripe'

export default defineEventHandler((event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权的后台请求。' })
  const stripe = publicStripeConfig(readStripeConfig())
  return {
    enabled: stripe.enabled,
    appId: stripe.publishableKey,
    gateway: 'https://api.stripe.com/v1/checkout/sessions',
    notifyUrl: stripe.successUrl,
    returnUrl: stripe.cancelUrl,
    subjectPrefix: stripe.subjectPrefix,
    hasPrivateKey: stripe.hasSecretKey,
    hasAlipayPublicKey: stripe.hasWebhookSecret
  }
})
