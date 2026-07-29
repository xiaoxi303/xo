# -*- coding: utf-8 -*-
with open(r'server/api/password-requests.post.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add db import and user email lookup
old_import = "import { dbCreatePasswordRequest, dbCheckRateLimitAndBlacklist } from '../utils/db'"
new_import = """import { dbCreatePasswordRequest, dbCheckRateLimitAndBlacklist, getD1Database } from '../utils/db'
import fs from 'node:fs'
import { getRuntimeDataPath } from '../utils/storage'"""

content = content.replace(old_import, new_import)

# Add email lookup after getting clientUsername
old_session = '''  // Retrieve client info if logged in
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  let clientEmail = ''
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username || ''
      clientEmail = session.email || ''
    }
  }'''

new_session = '''  // Retrieve client info if logged in
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  let clientEmail = ''
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username || ''
      // Look up user email from database
      const db = await getD1Database(event)
      if (db) {
        const user = await db.prepare('SELECT email FROM users WHERE username = ?').bind(clientUsername).first() as any
        clientEmail = user?.email || ''
      } else {
        const usersPath = getRuntimeDataPath('users.json')
        if (fs.existsSync(usersPath)) {
          try {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
            const user = users.find((u: any) => u.username === clientUsername)
            clientEmail = user?.email || ''
          } catch {}
        }
      }
    }
  }'''

content = content.replace(old_session, new_session)

with open(r'server/api/password-requests.post.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: Added email lookup from database')
