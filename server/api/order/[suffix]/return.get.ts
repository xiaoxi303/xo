import { getQuery, getRouterParam, createError, defineEventHandler } from 'h3'
import { readStripeConfig, retrieveStripeCheckoutSession } from '../../../utils/stripe'
import { getOrders, updateOrder } from '../../../utils/order-store'

export default defineEventHandler(async (event) => {
  const suffix = String(getRouterParam(event, 'suffix') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
  const query = getQuery(event) as Record<string, any>
  const sessionId = String(query.session_id || query.trade_no || '').trim()
  const outTradeNo = String(query.out_trade_no || '').trim()

  const config = readStripeConfig()

  let order = getOrders().find(item => (outTradeNo && item.outTradeNo === outTradeNo) || (suffix && item.suffix === suffix && item.status === 'created'))
  if (!order) {
    order = getOrders().find(item => suffix && item.suffix === suffix)
  }

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: '未检索到与该支付会话对应的有效订单。' })
  }

  // 若提供了 Stripe Session ID，向 Stripe 核验或自动更新
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

  // 本地预览与测试沙盒标记放行
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

  throw createError({ statusCode: 400, statusMessage: 'Stripe 支付尚未完成或未查询到有效结算记录。' })
})
