import { getCookie, setCookie } from 'h3'
import { dbGetProjects, dbGetUserRecord } from '../utils/db'
import { CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS, destroySession, validateSession } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const projects = await dbGetProjects(event)
    const token = getCookie(event, CLIENT_SESSION_COOKIE)
    const session = token ? validateSession(token) : null
    if (!session) return projects

    const user = await dbGetUserRecord(event, session.username)
    if (!user) return []
    if (user.isBlacklisted) {
      destroySession(token)
      setCookie(event, CLIENT_SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTS, maxAge: -1 })
      throw createError({ statusCode: 403, statusMessage: '客户账号已被拉黑，无法访问交付项目。' })
    }

    const allowed = new Set(
      String(user.allowedProjects || '')
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
    )
    return projects.filter((project: any) => allowed.has(String(project.slug)))
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Failed to read projects:', error)
    return []
  }
})
