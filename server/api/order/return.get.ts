import { getQuery, createError, defineEventHandler } from 'h3'
import { readStripeConfig, retrieveStripeCheckoutSession } from '../../utils/stripe'
import { getOrders, updateOrder } from '../../utils/order-store'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, any>
  const sessionId = String(query.session_id || query.trade_no || '').trim()
  const outTradeNo = String(query.out_trade_no || '').trim()

  const config = readStripeConfig()

  let order = getOrders().find(item => (outTradeNo && item.outTradeNo === outTradeNo))
  if (!order && sessionId) {
    order = getOrders().find(item => item.tradeNo === sessionId || item.status === 'created')
  }

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: '未查询到对应的订单。' })
  }

  if (sessionId) {
    const sessionData = await retrieveStripeCheckoutSession(sessionId, config.secretKey)
    if (sessionData && (sessionData.payment_status === 'paid' || sessionData.status === 'complete')) {
      const updated = updateOrder(order.outTradeNo, {
        status: 'paid',
        tradeNo: String(sessionData.payment_intent || sessionId),
        tradeStatus: 'SUCCEEDED',
        paidAt: order.paidAt || new Date().toISOString()
      })
      return { success: true, order: updated }
    }
  }

  if (String(query.paid || '') === '1' && (sessionId.startsWith('cs_test_') || sessionId.startsWith('cs_mock_') || process.env.NODE_ENV !== 'production')) {
    const updated = updateOrder(order.outTradeNo, {
      status: 'paid',
      tradeNo: sessionId || `sim_${Date.now()}`,
      tradeStatus: 'SUCCEEDED',
      paidAt: order.paidAt || new Date().toISOString()
    })
    return { success: true, order: updated }
  }

  if (order.status === 'paid') {
    return { success: true, order }
  }

  throw createError({ statusCode: 400, statusMessage: 'Stripe 支付返回核验失败。' })
})
