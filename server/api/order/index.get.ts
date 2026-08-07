import { getOrderPages } from '../../utils/order-pages'

export default defineEventHandler(() => {
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
