import { getRequestHeader, readRawBody, createError, defineEventHandler } from 'h3'
import { readStripeConfig, verifyStripeWebhook } from '../../utils/stripe'
import { getOrders, updateOrder } from '../../utils/order-store'

export default defineEventHandler(async (event) => {
  const sigHeader = getRequestHeader(event, 'stripe-signature') || ''
  const config = readStripeConfig()

  const rawBody = await readRawBody(event, 'utf8') || ''
  let payload: any = {}
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw createError({ statusCode: 400, statusMessage: '无效的 Webhook JSON 载荷' })
  }

  // 验证签名
  if (config.webhookSecret && sigHeader) {
    const verified = verifyStripeWebhook(rawBody, sigHeader, config.webhookSecret)
    if (!verified) {
      throw createError({ statusCode: 400, statusMessage: 'Stripe Webhook 签名核验失败' })
    }
  }

  const eventType = String(payload.type || '')
  const dataObj = payload?.data?.object || {}

  if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
    const outTradeNo = String(dataObj.client_reference_id || dataObj.metadata?.outTradeNo || '')
    const targetSuffix = String(dataObj.metadata?.suffix || '')

    const order = getOrders().find(item => (outTradeNo && item.outTradeNo === outTradeNo) || (targetSuffix && item.suffix === targetSuffix && item.status === 'created'))

    if (order) {
      const amountReceived = dataObj.amount_total ? (Number(dataObj.amount_total) / 100).toFixed(2) : order.amount
      updateOrder(order.outTradeNo, {
        status: 'paid',
        tradeNo: String(dataObj.payment_intent || dataObj.id || ''),
        buyerLogonId: String(dataObj.customer_details?.email || dataObj.receipt_email || ''),
        buyerUserId: String(dataObj.customer || ''),
        buyerPayAmount: amountReceived,
        tradeStatus: 'SUCCEEDED',
        paidAt: new Date().toISOString()
      })
    }
  }

  return { received: true }
})
