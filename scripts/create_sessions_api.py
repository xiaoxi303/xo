# -*- coding: utf-8 -*-
import codecs

# Create API to get all active client sessions
api_content = '''import fs from 'node:fs'
import { defineEventHandler, getCookie } from 'h3'
import { SESSION_COOKIE, getSessionInfo } from '../../utils/auth'
import { getRuntimeDataPath } from '../../utils/storage'

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

  // Read all sessions from disk
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
      // Only include non-admin sessions that haven't expired
      return sess.expiresAt > now && sess.username !== 'admin'
    })
    .map(([token, sess]: [string, any]) => ({
      token: token.slice(0, 8) + '...',  // Partial token for display
      username: sess.username,
      createdAt: sess.createdAt,
      expiresAt: sess.expiresAt,
      remainingSeconds: Math.max(0, Math.floor((sess.expiresAt - now) / 1000))
    }))
    .sort((a: any, b: any) => a.expiresAt - b.expiresAt)  // Sort by expiration

  return {
    success: true,
    sessions: activeSessions,
    count: activeSessions.length
  }
})
'''

with codecs.open(r'D:\Git\zpj\server\api\admin\active-sessions.get.ts', 'w', 'utf-8') as f:
    f.write(api_content)

print("Created active-sessions.get.ts")
