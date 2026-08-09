import { createError, getCookie } from 'h3'
import type { H3Event } from 'h3'
import { SESSION_COOKIE, validateSession } from './auth'

export function requireAdminSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  const session = token ? validateSession(token) : null
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}
