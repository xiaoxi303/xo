import crypto from 'node:crypto'
import { getQuery, getRouterParam } from 'h3'
import { normalizePublicKey, readAlipayConfig } from '../../../utils/alipay'
import { getOrders, updateOrder } from '../../../utils/order-store'

function verifyReturn(query: Record<string, any>, publicKey: string) {
  const sign = String(query.sign || '')
  if (!sign || String(query.sign_type || '') !== 'RSA2' || !publicKey) return false
  const content = Object.keys(query)
    .filter(key => !['sign', 'sign_type', 'paid'].includes(key) && query[key] !== '' && query[key] !== undefined && query[key] !== null)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&')
  try {
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(content, 'utf8')
    return verifier.verify(publicKey, sign, 'base64')
  } catch {
    return false
  }
}

export default defineEventHandler(event => {
  const suffix = String(getRouterParam(event, 'suffix') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
  const query = getQuery(event) as Record<string, any>
  const config = readAlipayConfig()
  if (!suffix || !verifyReturn(query, normalizePublicKey(config.alipayPublicKey))) {
    throw createError({ statusCode: 400, statusMessage: '支付宝返回验签失败' })
  }
  if (config.appId && String(query.app_id || query.auth_app_id || '') !== config.appId) {
    throw createError({ statusCode: 400, statusMessage: '支付宝应用校验失败' })
  }
  const outTradeNo = String(query.out_trade_no || '')
  const order = getOrders().find(item => item.outTradeNo === outTradeNo && item.suffix === suffix)
  if (!order) throw createError({ statusCode: 404, statusMessage: '订单不存在' })
  const totalAmount = Number(query.total_amount)
  if (!Number.isFinite(totalAmount) || totalAmount.toFixed(2) !== Number(order.amount).toFixed(2)) {
    throw createError({ statusCode: 400, statusMessage: '订单金额校验失败' })
  }
  const updated = updateOrder(outTradeNo, {
    status: 'paid',
    tradeNo: String(query.trade_no || order.tradeNo || ''),
    tradeStatus: 'TRADE_SUCCESS',
    paidAt: order.paidAt || new Date().toISOString()
  })
  return { success: true, order: updated }
})
