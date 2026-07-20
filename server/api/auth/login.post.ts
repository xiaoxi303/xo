/**
 * POST /api/auth/login
 * Validates credentials and creates a server-side session cookie.
 */
import { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, verifyPassword, createSession, SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码。' })
  }

  // Validate credentials
  if (username !== ADMIN_USERNAME || !verifyPassword(password, ADMIN_PASSWORD_HASH)) {
    // Artificial delay to prevent brute-force timing attacks
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误。' })
  }

  // Create session
  const token = createSession(username)

  // Set HTTP-only cookie
  setCookie(event, SESSION_COOKIE, token, SESSION_COOKIE_OPTS)

  return { success: true, username }
})
