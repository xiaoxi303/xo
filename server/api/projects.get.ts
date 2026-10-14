import { getCookie, setCookie } from 'h3'
import { dbGetProjects, dbGetUserRecord } from '../utils/db'
import { CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS, destroySession, validateSession } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const projects = await dbGetProjects(event)
    return Array.isArray(projects) ? projects : []
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Failed to read projects:', error)
    return []
  }
})
