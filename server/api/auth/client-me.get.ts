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

  let email = ''
  let wechat = ''
  let phone = ''
  let nickname = ''
  let company = ''
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
      phone = user.phone || ''
      nickname = user.nickname || ''
      company = user.company || ''
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

    // Try finding latest booking for this user to get phone/company if not set on user
    try {
      const bookingsPath = getRuntimeDataPath('bookings.json')
      if (fs.existsSync(bookingsPath)) {
        const bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'))
        const cleanEmail = (email || '').toLowerCase()
        const userBooking = bookings.find((b: any) => 
          (cleanEmail && String(b.email || '').toLowerCase() === cleanEmail) ||
          (deliverySuffix && (b.deliverySuffix === deliverySuffix || b.orderSuffix === deliverySuffix)) ||
          (phone && b.phone === phone)
        )
        if (userBooking) {
          if (!phone && userBooking.phone) phone = userBooking.phone
          if (!company && userBooking.company) company = userBooking.company
        }
      }
    } catch {}
  } catch (e) {}

  return {
    loggedIn: true,
    username: session.username,
    nickname,
    email,
    wechat,
    phone,
    company,
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
