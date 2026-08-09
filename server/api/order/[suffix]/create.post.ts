import { getRouterParam, getRequestURL } from 'h3'
import { randomBytes } from 'node:crypto'
import { buildAlipayPagePay, readAlipayConfig } from '../../../utils/alipay'
import { getOrderPage } from '../../../utils/order-pages'
import { saveOrder } from '../../../utils/order-store'
import { decryptRsaHybrid, isRsaHybridPayload, md5Fingerprint } from '../../../utils/rsa-hybrid'

export default defineEventHandler(async (event) => {
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
  saveOrder({
    outTradeNo,
    suffix,
    subject: page.subject,
    amount: amount.toFixed(2),
    status: 'created',
    note: String(body.note || '').trim().slice(0, 300),
    createdAt: new Date().toISOString()
  })
  return { success: true, gateway: config.gateway, outTradeNo, ...params }
})
