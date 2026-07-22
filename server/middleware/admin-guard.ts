/**
 * Server middleware — protects all admin API write operations.
 * Validates session cookie before allowing POST/PUT/DELETE on:
 *   - /api/projects
 *   - /api/site-config
 */
import { validateSession, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const method = event.method

  // Exclude public client-facing endpoints under /api/projects
  if (url.pathname.includes('/unlock') || url.pathname.includes('/get-password-direct')) {
    return
  }

  // Only guard mutating methods on admin-sensitive routes
  const isAdminRoute =
    url.pathname.startsWith('/api/projects') ||
    url.pathname.startsWith('/api/site-config')

  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

  if (isAdminRoute && isMutation) {
    const token = getCookie(event, SESSION_COOKIE)
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: '请先登录后台管理。' })
    }
    const session = validateSession(token)
    if (!session) {
      throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })
    }
  }
})
