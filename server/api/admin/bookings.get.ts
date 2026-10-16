import { defineEventHandler, getCookie } from 'h3'
import { SESSION_COOKIE, getSessionInfo } from '../../utils/auth'
import { getRuntimeDataPath, readEncryptedJson } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  // Check admin authentication
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  
  const session = getSessionInfo(token)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const bookingsPath = getRuntimeDataPath('bookings.json')
  const bookings = readEncryptedJson<any[]>(bookingsPath, [])

  return { success: true, bookings }
})
