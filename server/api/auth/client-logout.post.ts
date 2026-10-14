import { CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS, destroySession } from '../../utils/auth'

export default defineEventHandler((event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (token) {
    destroySession(token)
  }

  // Clear cookie by setting it to empty and maxAge to -1
  setCookie(event, CLIENT_SESSION_COOKIE, '', {
    ...SESSION_COOKIE_OPTS,
    maxAge: -1
  })

  return {
    success: true
  }
})

