import { validateSession, CLIENT_SESSION_COOKIE } from '../../utils/auth'
import { getRuntimeDataPath } from '../../utils/storage'
import { dbGetProjectsRaw } from '../../utils/db'
import fs from 'node:fs'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录客户账号。' })
  }

  const session = validateSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })
  }

  const username = session.username

  // 1. Get client user profile
  let clientProfile: any = null
  const usersPath = getRuntimeDataPath('users.json')
  if (fs.existsSync(usersPath)) {
    try {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
      const found = users.find((u: any) => u.username === username)
      if (found) {
        const { password, ...rest } = found
        clientProfile = rest
      }
    } catch (e) {}
  }

  if (!clientProfile) {
    throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
  }

  // 2. Get allowed projects list
  const allProjects = await dbGetProjectsRaw(event).catch(() => [])
  const allowedSlugs = (clientProfile.allowedProjects || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)

  const allowedProjects = allProjects
    .filter((p: any) => allowedSlugs.includes(p.slug))
    .map((p: any) => ({
      slug: p.slug,
      title: p.title,
      image: p.image,
      description: p.description,
      password: p.password || ''
    }))

  // 3. Get client password requests
  let clientRequests: any[] = []
  const requestsPath = getRuntimeDataPath('password-requests.json')
  if (fs.existsSync(requestsPath)) {
    try {
      const requests = JSON.parse(fs.readFileSync(requestsPath, 'utf-8'))
      clientRequests = requests.filter((r: any) => {
        return (
          r.clientUsername === username ||
          (r.clientName && r.clientName.includes(`账号: ${username}`))
        )
      })
    } catch (e) {}
  }

  return {
    profile: clientProfile,
    allowedProjects,
    requests: clientRequests
  }
})
