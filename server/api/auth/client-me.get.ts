import { validateSession, CLIENT_SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    return { loggedIn: false }
  }

  const session = validateSession(token)
  if (!session) {
    return { loggedIn: false }
  }

  return {
    loggedIn: true,
    username: session.username
  }
})
