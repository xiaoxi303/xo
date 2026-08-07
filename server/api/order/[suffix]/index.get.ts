import { getRouterParam } from 'h3'
import { getOrderPage } from '../../../utils/order-pages'
import { readAlipayConfig, publicAlipayConfig } from '../../../utils/alipay'

export default defineEventHandler((event) => {
  const suffix = String(getRouterParam(event, 'suffix') || '')
  const page = getOrderPage(suffix)
  if (!page || !page.enabled) throw createError({ statusCode: 404, statusMessage: '订单页面不存在或已关闭。' })
  return {
    suffix: page.suffix,
    subject: page.subject,
    amount: page.amount,
    description: page.description,
    clientName: page.clientName,
    successText: page.successText,
    paymentEnabled: publicAlipayConfig(readAlipayConfig()).enabled
  }
})
