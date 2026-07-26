import { dbGetProjectsRaw, dbGetProjectPassword, dbCreatePasswordRequest, getD1Database } from '../../../utils/db'
import { getRuntimeDataPath } from '../../../utils/storage'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../../utils/auth'
import { getDailyPassword } from '../../../utils/password-utils'
import fs from 'node:fs'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Please login first.' })
  }
  const session = validateSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Session expired, please login again.' })
  }

  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project slug.' })
  }

  // Always use dynamic password based on slug
  let password = getDailyPassword(slug)

  // Get project title for logging
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find(p => p.slug === slug)
  const projectTitle = project ? project.title : slug

  // Log request
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
