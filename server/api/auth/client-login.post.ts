import { dbGetUsers } from '../../utils/db'
import { verifyPassword, createSession, CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码。' })
  }

  // Retrieve raw users list to perform password verification
  // Wait, dbGetUsers strips password from results.
  // We need to retrieve the user including password hash.
  // Let's create a local helper to retrieve raw user from DB or JSON file.
  const { getD1Database, getRuntimeDataPath } = await import('../../utils/db')
  const fs = await import('node:fs')
  
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
    // Artificial delay to prevent brute force timing attacks
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误。' })
  }

  // Verify client password
  if (!verifyPassword(password, userRecord.password)) {
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误。' })
  }

  // Create session and set cookie
  const token = createSession(username)
  setCookie(event, CLIENT_SESSION_COOKIE, token, SESSION_COOKIE_OPTS)

  return {
    success: true,
    username: userRecord.username,
    role: userRecord.role
  }
})
