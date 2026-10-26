import { getRouterParam, getRequestURL, getCookie, createError, defineEventHandler, readBody } from 'h3'
import { randomBytes } from 'node:crypto'
import { readStripeConfig, createStripeCheckoutSession } from '../../../utils/stripe'
import { getOrderPage } from '../../../utils/order-pages'
import { saveOrder } from '../../../utils/order-store'
import { decryptRsaHybrid, isRsaHybridPayload, md5Fingerprint } from '../../../utils/vault-cipher'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../../utils/auth'
import { getRealClientIP } from '../../../utils/ip-helper'
import { checkRateLimit, recordFailedAttempt } from '../../../utils/rate-limiter'

function throwClientError(statusCode: number, msg: string) {
  throw createError({
    statusCode,
    statusMessage: 'ORDER_CHECKOUT_ERROR',
    message: msg,
    data: { statusMessage: msg }
  })
}

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)
  const rateLimitKey = `order-create:${ip}`
  const { isLocked, remainingLockSeconds } = checkRateLimit(rateLimitKey)
  if (isLocked) {
    throwClientError(429, `下单请求过于频繁，请等待 ${remainingLockSeconds} 秒后再试。`)
  }
  // 防刷单流控保护：每个 IP 每 10 分钟最多 15 笔
  recordFailedAttempt(rateLimitKey, 15, 10 * 60)

  const config = readStripeConfig()
  if (!config.enabled || !config.publishableKey || !config.secretKey) {
    throwClientError(400, 'Stripe 支付通道尚未完成配置或未启用（请在后台填入 Publishable Key 与 Secret Key 并开启支付）。')
  }

  const suffix = String(getRouterParam(event, 'suffix') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
  const page = getOrderPage(suffix)
  if (!suffix || !page || !page.enabled) {
    throwClientError(404, '订单页面不存在或已关闭')
  }

  let body = event.context.decryptedBody || (await readBody(event).catch(() => ({})) as any)
  if (!event.context.hybridDecrypted && isRsaHybridPayload(body)) {
    try {
      body = JSON.parse(await decryptRsaHybrid(body, event))
      body.security = {
        algorithm: 'SECURE-QUANTUM-HYBRID',
        md5: md5Fingerprint(JSON.stringify(body))
      }
    } catch {
      throwClientError(400, '安全策略拦截：密文校验未通过或凭证失效，请刷新页面后重试。')
    }
  }

  const amount = Number(page!.amount)
  if (!page!.subject || !Number.isFinite(amount) || amount <= 0) {
    throwClientError(400, '订单页面金额或参数配置无效')
  }

  const requestUrl = getRequestURL(event)
  const origin = `${requestUrl.protocol}//${requestUrl.host}`
  const outTradeNo = `XO${Date.now()}${randomBytes(4).toString('hex')}`

  const successUrl = config.successUrl || `${origin}/order/${suffix}?session_id={CHECKOUT_SESSION_ID}&paid=1`
  const cancelUrl = config.cancelUrl || `${origin}/order/${suffix}?canceled=1`

  const session = await createStripeCheckoutSession(config, {
    outTradeNo,
    subject: `${config.subjectPrefix ? config.subjectPrefix + ' · ' : ''}${page!.subject}`,
    totalAmount: amount,
    currency: config.currency || 'cny',
    successUrl,
    cancelUrl,
    metadata: {
      outTradeNo,
      suffix,
      note: String(body.note || '').trim().slice(0, 300)
    }
  })

  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let loggedInClient = ''
  if (token) {
    const clientSession = validateSession(token)
    if (clientSession?.username) {
      loggedInClient = clientSession.username
    }
  }

  saveOrder({
    outTradeNo,
    suffix,
    subject: page!.subject,
    amount: amount.toFixed(2),
    status: 'created',
    note: String(body.note || '').trim().slice(0, 300),
    clientUsername: loggedInClient || page!.clientUsername || '',
    clientName: page!.clientName || '',
    bookingId: page!.bookingId || '',
    createdAt: new Date().toISOString()
  })

  return {
    success: true,
    url: session.url,
    sessionId: session.id,
    outTradeNo,
    gateway: session.url
  }
})
