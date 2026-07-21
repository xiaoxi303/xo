import { CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'

export default defineEventHandler((event) => {
  // Clear cookie by setting it to empty and maxAge to -1
  setCookie(event, CLIENT_SESSION_COOKIE, '', {
    ...SESSION_COOKIE_OPTS,
    maxAge: -1
  })

  return {
    success: true
  }
})
