import { getRouterParam, getRequestURL } from 'h3'
import { randomBytes } from 'node:crypto'
import { buildAlipayPagePay, readAlipayConfig } from '../../../utils/alipay'
import { getOrderPage } from '../../../utils/order-pages'
import { saveOrder } from '../../../utils/order-store'

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
  const body = await readBody(event).catch(() => ({})) as any
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
