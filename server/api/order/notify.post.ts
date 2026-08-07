import crypto from 'node:crypto'
import { normalizePublicKey, readAlipayConfig } from '../../utils/alipay'
import { getOrders, updateOrder } from '../../utils/order-store'

function verifyNotify(body: Record<string, any>, publicKey: string) {
  const sign = String(body.sign || '')
  if (!sign || String(body.sign_type || '') !== 'RSA2' || !publicKey) return false
  const content = Object.keys(body)
    .filter(key => key !== 'sign' && key !== 'sign_type' && body[key] !== '' && body[key] !== undefined && body[key] !== null)
    .sort().map(key => `${key}=${body[key]}`).join('&')
  try {
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(content, 'utf8')
    return verifier.verify(publicKey, sign, 'base64')
  } catch {
    return false
  }
}

export default defineEventHandler(async event => {
  const body = await readBody(event).catch(() => ({})) as Record<string, any>
  const config = readAlipayConfig()
  if (!verifyNotify(body, normalizePublicKey(config.alipayPublicKey))) throw createError({ statusCode: 400, statusMessage: '支付宝通知验签失败' })
  const outTradeNo = String(body.out_trade_no || '')
  const order = getOrders().find(item => item.outTradeNo === outTradeNo)
  if (!order) throw createError({ statusCode: 400, statusMessage: '订单不存在' })
  const totalAmount = Number(body.total_amount)
  if (!Number.isFinite(totalAmount) || totalAmount.toFixed(2) !== Number(order.amount).toFixed(2)) {
    throw createError({ statusCode: 400, statusMessage: '订单金额校验失败' })
  }
  const tradeStatus = String(body.trade_status || '')
  if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
    updateOrder(outTradeNo, {
      status: 'paid',
      tradeNo: String(body.trade_no || order.tradeNo || ''),
      buyerLogonId: String(body.buyer_logon_id || order.buyerLogonId || ''),
      buyerUserId: String(body.buyer_user_id || order.buyerUserId || ''),
      buyerPayAmount: String(body.buyer_pay_amount || body.receipt_amount || body.total_amount || order.buyerPayAmount || ''),
      tradeStatus,
      paidAt: order.paidAt || String(body.gmt_payment || new Date().toISOString())
    })
  }
  return 'success'
})
