/**
 * POST /api/auth/logout
 * Destroys the session and clears the cookie.
 */
import { destroySession, SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) destroySession(token)

  // Clear the cookie by setting maxAge to 0
  setCookie(event, SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTS, maxAge: 0 })

  return { success: true }
})
