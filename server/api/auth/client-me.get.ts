import { getSessionInfo, CLIENT_SESSION_COOKIE } from '../../utils/auth'
import { dbGetUsers } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    return { loggedIn: false }
  }

  const session = getSessionInfo(token)
  if (!session) {
    return { loggedIn: false }
  }

  // Look up user details from database
  let email = ''
  let wechat = ''
  try {
    const users = await dbGetUsers(event)
    const user = users.find((u: any) => u.username === session.username)
    if (user) {
      email = user.email || ''
      wechat = user.wechat || ''
    }
  } catch (e) {}

  return {
    loggedIn: true,
    username: session.username,
    email,
    wechat,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    remainingSeconds: session.remainingSeconds
  }
})