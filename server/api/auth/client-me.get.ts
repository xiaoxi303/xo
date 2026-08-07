import { getSessionInfo, destroySession, CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'
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
  let deliverySuffix = ''
  let deliveryKeyHint = ''
  let warningCount = 0
  let isBlacklisted = false
  let blacklistReason = ''
  try {
    const users = await dbGetUsers(event)
    const user = users.find((u: any) => u.username === session.username)
    if (user) {
      email = user.email || ''
      wechat = user.wechat || ''
      deliverySuffix = user.deliverySuffix || ''
      deliveryKeyHint = user.deliveryKeyHint || ''
      warningCount = Number(user.warningCount) || 0
      isBlacklisted = !!user.isBlacklisted
      blacklistReason = user.blacklistReason || ''
      if (user.isBlacklisted) {
        destroySession(token)
        setCookie(event, CLIENT_SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTS, maxAge: -1 })
        return {
          loggedIn: false,
          blocked: true,
          username: session.username,
          blacklistReason
        }
      }
    }
  } catch (e) {}

  return {
    loggedIn: true,
    username: session.username,
    email,
    wechat,
    deliverySuffix,
    deliveryKeyHint,
    warningCount,
    isBlacklisted,
    blacklistReason,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    remainingSeconds: session.remainingSeconds
  }
})
