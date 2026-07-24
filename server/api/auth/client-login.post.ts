import { getD1Database } from '../../utils/db'
import { getRuntimeDataPath } from '../../utils/storage'
import { verifyPassword, createSession, getSessionInfo, CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'
import fs from 'node:fs'
import { logSecurityEvent } from '../../utils/security-logger'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码。' })
  }

  // Retrieve raw users list to perform password verification
  // We need to retrieve the user including password hash.
  let userRecord: any = null
  const db = await getD1Database(event)
  if (db) {
    userRecord = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first()
  } else {
    // Local JSON fallback
    const usersPath = getRuntimeDataPath('users.json')
    if (fs.existsSync(usersPath)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
        userRecord = users.find((u: any) => u.username === username)
      } catch (e) {}
    }
  }

  if (!userRecord) {
    logSecurityEvent({
      type: 'Client Token Guard',
      ip,
      action: `Failed client login for username "${username}"`,
      status: 'blocked'
    })
    // Artificial delay to prevent brute force timing attacks
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误。' })
  }

  // Verify client password
  if (!verifyPassword(password, userRecord.password)) {
    logSecurityEvent({
      type: 'Client Token Guard',
      ip,
      action: `Failed client login for username "${username}"`,
      status: 'blocked'
    })
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误。' })
  }

  // Create session and set cookie
  const token = createSession(username)
  setCookie(event, CLIENT_SESSION_COOKIE, token, SESSION_COOKIE_OPTS)
  const session = getSessionInfo(token)

  logSecurityEvent({
    type: 'Client Access Gate',
    ip,
    action: `Client session issued for "${username}"`,
    status: 'success'
  })

  return {
    success: true,
    username: userRecord.username,
    role: userRecord.role,
    expiresAt: session?.expiresAt || 0,
    remainingSeconds: session?.remainingSeconds || 0
  }
})
