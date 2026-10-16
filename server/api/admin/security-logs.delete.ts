import { defineEventHandler, getCookie, readBody } from 'h3'
import { SESSION_COOKIE, getSessionInfo } from '../../utils/auth'
import { getSecurityLogs } from '../../utils/security-logger'
import { getRuntimeDataPath, writeEncryptedJson } from '../../utils/storage'

const LOG_FILE = getRuntimeDataPath('security-logs.json')

export default defineEventHandler(async (event) => {
  // Check admin authentication
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const session = getSessionInfo(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { id, deleteAll } = body || {}

  try {
    if (deleteAll) {
      // Delete all logs
      writeEncryptedJson(LOG_FILE, [])
      return { success: true, message: 'All logs deleted' }
    }

    if (id) {
      // Delete single log by ID
      const logs = getSecurityLogs()
      const filtered = logs.filter(log => log.id !== id)
      writeEncryptedJson(LOG_FILE, filtered)
      return { success: true, message: 'Log deleted' }
    }

    throw createError({ statusCode: 400, statusMessage: 'Missing id or deleteAll parameter' })
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete logs' })
  }
})
