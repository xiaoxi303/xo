import { getCookie } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { getOrders } from '../../utils/order-store'

export default defineEventHandler((event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权的后台请求' })
  return getOrders()
})
