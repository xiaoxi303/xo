/**
 * GET /api/projects/:slug/get-password-direct
 * Direct password retrieval for authenticated clients
 */
import { dbGetProjectsRaw, dbGetProjectPassword, dbCreatePasswordRequest, getD1Database } from '../../../utils/db'
import { getRuntimeDataPath } from '../../../utils/storage'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../../utils/auth'
import { generateDailyPassword, getBeijingDateString } from '../../../utils/password-utils'
import fs from 'node:fs'

export default defineEventHandler(async (event) => {
  // 1. Authenticate client session
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Please login first.' })
  }
  const session = validateSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Session expired, please login again.' })
  }

  // 2. Fetch client user details
  let clientUser = null
  const db = await getD1Database(event)
  if (db) {
    clientUser = await db.prepare('SELECT role, allowedProjects FROM users WHERE username = ?').bind(session.username).first()
  } else {
    const usersPath = getRuntimeDataPath('users.json')
    if (fs.existsSync(usersPath)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
        clientUser = users.find((u) => u.username === session.username)
      } catch (e) {}
    }
  }

  if (clientUser && clientUser.role === 'disabled') {
    throw createError({ statusCode: 403, statusMessage: 'Account disabled.' })
  }

  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project slug.' })
  }

  if (clientUser && clientUser.allowedProjects && clientUser.allowedProjects.trim() !== '') {
    const allowed = clientUser.allowedProjects.split(',').map((s) => s.trim())
    if (!allowed.includes(slug)) {
      throw createError({ statusCode: 403, statusMessage: 'Not authorized for this project.' })
    }
  }

  // 3. Get password - always use dynamic password (static password input removed)
  const today = getBeijingDateString()
  let password = generateDailyPassword(slug, today)

  if (!password) {
    return { password: null }
  }

  // 4. Get project title for logging
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find(p => p.slug === slug)
  const projectTitle = project ? project.title : slug

  // 5. Log request
  let ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

  const reqObj = {
    clientName: 'Direct Access (' + session.username + ')',
    contact: 'IP: ' + ip,
    projectSlug: slug,
    projectTitle: projectTitle,
    clientUsername: session.username,
    status: 'approved'
  }

  await dbCreatePasswordRequest(event, reqObj)

  return { password }
})
