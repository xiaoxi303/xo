import { defineEventHandler, getCookie } from 'h3'
import fs from 'node:fs'
import { validateSession, SESSION_COOKIE } from '../../utils/auth'
import { getRuntimeDataPath } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    return []
  }

  const method = event.node.req.method

  const blPath = getRuntimeDataPath('blacklist.json')

  if (method === 'GET') {
    if (!fs.existsSync(blPath)) return []
    try {
      const raw = fs.readFileSync(blPath, 'utf-8')
      return JSON.parse(raw)
    } catch (e) {
      return []
    }
  }

  if (method === 'POST') {
    return { success: true, blacklist: [] }
  }

  return []
})
