import { dbGetProjectsRaw, dbGetProjectPassword, dbCreatePasswordRequest } from '../../../utils/db'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  // 1. Authenticate client session
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录，请先登录以在线获取密码。' })
  }
  const session = validateSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })
  }

  // 2. Fetch client user details to check status and allowed project permissions
  const { getD1Database, getRuntimeDataPath } = await import('../../../utils/db')
  const fs = await import('node:fs')
  let clientUser: any = null
  const db = await getD1Database(event)
  if (db) {
    clientUser = await db.prepare('SELECT role, allowedProjects FROM users WHERE username = ?').bind(session.username).first()
  } else {
    const usersPath = getRuntimeDataPath('users.json')
    if (fs.existsSync(usersPath)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
        clientUser = users.find((u: any) => u.username === session.username)
      } catch (e) {}
    }
  }

  if (clientUser) {
    if (clientUser.role === 'disabled') {
      throw createError({ statusCode: 403, statusMessage: '您的客户账号已被禁用，请联系主理人。' })
    }
  }

  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: '缺少项目标识。' })
  }

  if (clientUser && clientUser.allowedProjects && clientUser.allowedProjects.trim() !== '') {
    const allowed = clientUser.allowedProjects.split(',').map((s: string) => s.trim())
    if (!allowed.includes(slug)) {
      throw createError({ statusCode: 403, statusMessage: '您未获授权在线提取该作品的访问密码，请联系主理人添加授权。' })
    }
  }

  // 2. Retrieve raw password safely using server-only helper
  const password = await dbGetProjectPassword(event, slug)

  // If project doesn't have password, return null
  if (!password) {
    return { password: null }
  }

  // 3. Get the actual project title for logging
  const projects = await dbGetProjectsRaw(event)
  const project = projects.find(p => p.slug === slug)
  const projectTitle = project ? project.title : slug

  // 4. Extract client IP and short User-Agent details
  const ip = getRequestIP(event, { xForwardedFor: true }) || '未知 IP'
  const userAgent = getHeader(event, 'user-agent') || ''
  let device = 'PC'
  if (/mobile/i.test(userAgent)) device = '移动端'
  else if (/ipad/i.test(userAgent)) device = 'iPad'

  // Log this direct access request to the database/json file
  await dbCreatePasswordRequest(event, {
    clientName: `直接在线获取 (账号: ${session.username})`,
    contact: `IP: ${ip} (${device})`,
    projectSlug: slug,
    projectTitle: projectTitle
  })

  // Return the actual password to the client
  return {
    password
  }
})
