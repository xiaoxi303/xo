import { getRouterParam, createError, defineEventHandler } from 'h3'
import { getOrderPage } from '../../../utils/order-pages'
import { readStripeConfig, publicStripeConfig } from '../../../utils/stripe'

export default defineEventHandler((event) => {
  const suffix = String(getRouterParam(event, 'suffix') || '')
  const page = getOrderPage(suffix)
  if (!page || !page.enabled) throw createError({ statusCode: 404, statusMessage: '订单页面不存在或已关闭。' })

  const stripe = publicStripeConfig(readStripeConfig())

  return {
    suffix: page.suffix,
    subject: page.subject,
    amount: page.amount,
    description: page.description,
    clientName: page.clientName,
    clientUsername: page.clientUsername || '',
    successText: page.successText,
    paymentEnabled: stripe.enabled,
    currency: stripe.currency || 'cny',
    publishableKey: stripe.publishableKey || ''
  }
})
