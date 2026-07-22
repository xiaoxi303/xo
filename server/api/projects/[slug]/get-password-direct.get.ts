import { dbGetProjectsRaw, dbGetProjectPassword, dbCreatePasswordRequest, getD1Database } from '../../../utils/db'
import { getRuntimeDataPath } from '../../../utils/storage'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../../utils/auth'
import fs from 'node:fs'

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
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) {
    ip = cfConnectingIp.trim()
  } else if (xRealIp) {
    ip = xRealIp.trim()
  } else if (xForwardedFor) {
    const parts = xForwardedFor.split(',')
    ip = parts[0]?.trim() || ''
  }
  
  if (!ip) {
    ip = getRequestIP(event, { xForwardedFor: true }) || '未知 IP'
  }
  
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1'
  }

  const userAgent = getHeader(event, 'user-agent') || ''
  let device = 'PC'
  if (/mobile/i.test(userAgent)) device = '移动端'
  else if (/ipad/i.test(userAgent)) device = 'iPad'

  // 5. Log this direct access request with complete client metadata (WeChat, Email, IP)
  const contactDetails = []
  if (clientUser?.wechat) contactDetails.push(`微信: ${clientUser.wechat}`)
  if (clientUser?.email) contactDetails.push(`邮箱: ${clientUser.email}`)
  contactDetails.push(`IP: ${ip} (${device})`)
  
  const reqObj = {
    clientName: `直接在线获取 (账号: ${session.username})`,
    contact: contactDetails.join(' | '),
    projectSlug: slug,
    projectTitle: projectTitle,
    clientUsername: session.username,
    status: 'approved'
  }

  await dbCreatePasswordRequest(event, reqObj)

  // Send automatic receipt email in the background
  const { sendApprovalEmail } = await import('../../../utils/email')
  sendApprovalEmail(event, reqObj).catch(err => {
    console.error('Background direct receipt email failed:', err)
  })

  // Return the actual password to the client
  return {
    password
  }
})
