import fs from 'node:fs'
import { defineEventHandler, getCookie, readBody } from 'h3'
import { SESSION_COOKIE, getSessionInfo, destroySession } from '../../utils/auth'
import { getRuntimeDataPath } from '../../utils/storage'
import { logSecurityEvent } from '../../utils/security-logger'

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

  // Handle DELETE request - force logout
  if (event.method === 'DELETE') {
    const body = await readBody(event)
    const { token: targetToken } = body || {}
    
    if (!targetToken) {
      throw createError({ statusCode: 400, statusMessage: 'Missing token' })
    }

    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    
    // Get session info before destroying
    const targetSession = getSessionInfo(targetToken)
    
    // Destroy the session
    destroySession(targetToken)
    
    // Log the force logout
    logSecurityEvent({
      type: 'Admin Force Logout',
      ip,
      action: `Admin forced logout user "${targetSession?.username || 'unknown'}"`,
      status: 'warning'
    })

    return { success: true, message: 'Session destroyed' }
  }

  // Handle GET request - list active sessions
  const sessionsPath = getRuntimeDataPath('.sessions.json')
  let allSessions: Record<string, any> = {}
  
  try {
    if (fs.existsSync(sessionsPath)) {
      const content = fs.readFileSync(sessionsPath, 'utf-8')
      allSessions = JSON.parse(content)
    }
  } catch {
    allSessions = {}
  }

  const now = Date.now()
  
  // Filter and format active client sessions (exclude admin sessions)
  const activeSessions = Object.entries(allSessions)
    .filter(([_, sess]: [string, any]) => {
      return sess.expiresAt > now && sess.username !== 'admin'
    })
    .map(([sessToken, sess]: [string, any]) => ({
      token: sessToken.slice(0, 8) + '...',
      fullToken: sessToken,
      username: sess.username,
      createdAt: sess.createdAt,
      expiresAt: sess.expiresAt,
      remainingSeconds: Math.max(0, Math.floor((sess.expiresAt - now) / 1000))
    }))
    .sort((a: any, b: any) => a.expiresAt - b.expiresAt)

  return {
    success: true,
    sessions: activeSessions,
    count: activeSessions.length
  }
})
