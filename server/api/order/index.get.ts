import { getOrderPages } from '../../utils/order-pages'
import { getQuery } from 'h3'
import returnHandler from './return.get'

export default defineEventHandler(event => {
  if (getQuery(event).out_trade_no) return returnHandler(event)
  return getOrderPages()
    .filter(page => page.enabled)
    .map(page => ({
      suffix: page.suffix,
      subject: page.subject,
      amount: page.amount,
      description: page.description,
      clientName: page.clientName
    }))
})
