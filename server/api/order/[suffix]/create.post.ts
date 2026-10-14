import { getRouterParam, getRequestURL, getCookie } from 'h3'
import { randomBytes } from 'node:crypto'
import { buildAlipayPagePay, readAlipayConfig } from '../../../utils/alipay'
import { getOrderPage } from '../../../utils/order-pages'
import { saveOrder } from '../../../utils/order-store'
import { decryptRsaHybrid, isRsaHybridPayload, md5Fingerprint } from '../../../utils/vault-cipher'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../../utils/auth'
import { getRealClientIP } from '../../../utils/ip-helper'
import { checkRateLimit, recordFailedAttempt } from '../../../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)
  const rateLimitKey = `order-create:${ip}`
  const { isLocked, remainingLockSeconds } = checkRateLimit(rateLimitKey)
  if (isLocked) {
    throw createError({
      statusCode: 429,
      statusMessage: `下单请求过于频繁，请等待 ${remainingLockSeconds} 秒后再试。`
    })
  }
  // Flood protection: max 15 orders per 10 minutes per IP
  recordFailedAttempt(rateLimitKey, 15, 10 * 60)

  const config = readAlipayConfig()
  if (!config.enabled || !config.appId || !config.privateKey) {
    throw createError({ statusCode: 503, statusMessage: '支付宝支付尚未完成配置' })
  }
  const suffix = String(getRouterParam(event, 'suffix') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
  const page = getOrderPage(suffix)
  if (!suffix || !page || !page.enabled) {
    throw createError({ statusCode: 404, statusMessage: '订单页面不存在或已关闭' })
  }
  let body = await readBody(event).catch(() => ({})) as any
  if (isRsaHybridPayload(body)) {
    try {
      body = JSON.parse(decryptRsaHybrid(body))
      body.security = {
        algorithm: 'RSA-OAEP-256+AES-256-GCM+RSA-PSS-SHA256',
        md5: md5Fingerprint(JSON.stringify(body))
      }
    } catch (error: any) {
      throw createError({ statusCode: 400, statusMessage: error?.message || 'RSA 请求解密失败' })
    }
  }
  const amount = Number(page.amount)
  if (!page.subject || !Number.isFinite(amount)) {
    throw createError({ statusCode: 500, statusMessage: '订单页面配置无效' })
  }
  const requestUrl = getRequestURL(event)
  const origin = `${requestUrl.protocol}//${requestUrl.host}`
  const outTradeNo = `XO${Date.now()}${randomBytes(4).toString('hex')}`
  const params = buildAlipayPagePay(config, {
    outTradeNo,
    subject: page.subject,
    totalAmount: amount.toFixed(2),
    notifyUrl: config.notifyUrl || `${origin}/api/order/${suffix}/notify`,
    returnUrl: config.returnUrl || `${origin}/order/${suffix}?paid=1`
  })
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let loggedInClient = ''
  if (token) {
    const session = validateSession(token)
    if (session?.username) {
      loggedInClient = session.username
    }
  }

  saveOrder({
    outTradeNo,
    suffix,
    subject: page.subject,
    amount: amount.toFixed(2),
    status: 'created',
    note: String(body.note || '').trim().slice(0, 300),
    clientUsername: loggedInClient || page.clientUsername || '',
    clientName: page.clientName || '',
    bookingId: page.bookingId || '',
    createdAt: new Date().toISOString()
  })
  return { success: true, gateway: config.gateway, outTradeNo, ...params }
})
