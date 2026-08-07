import { getCookie } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { saveOrderPage } from '../../utils/order-pages'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权的后台请求。' })
  const body = await readBody(event).catch(() => ({})) as any
  try {
    return { success: true, page: saveOrderPage(body) }
  } catch (error: any) {
    throw createError({ statusCode: 400, statusMessage: error.message || '保存订单页面失败。' })
  }
})
