import { getCookie, createError, defineEventHandler } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { publicStripeConfig, readStripeConfig } from '../../utils/stripe'

export default defineEventHandler((event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未授权的后台管理请求。' })
  }

  return publicStripeConfig(readStripeConfig())
})
