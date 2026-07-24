import fs from 'node:fs'
import { defineEventHandler, getCookie } from 'h3'
import { SESSION_COOKIE, getSessionInfo } from '../../utils/auth'
import { getRuntimeDataPath } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  // Check admin authentication
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  
  const session = getSessionInfo(token)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const bookingsPath = getRuntimeDataPath('bookings.json')
  let bookings: any[] = []
  
  try {
    if (fs.existsSync(bookingsPath)) {
      bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'))
    }
  } catch {
    bookings = []
  }

  return { success: true, bookings }
})
