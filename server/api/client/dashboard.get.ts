import { validateSession, CLIENT_SESSION_COOKIE } from '../../utils/auth'
import { dbGetProjectsRaw, dbGetPasswordRequests, dbGetUsers } from '../../utils/db'
import { getDailyPassword } from '../../utils/password-utils'

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
  const allUsers = await dbGetUsers(event).catch(() => [])
  const foundUser = allUsers.find((u: any) => u.username === username)

  if (!foundUser) {
    throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
  }

  const { password: _p, ...clientProfile } = foundUser
  const clientEmail = (clientProfile.email || '').trim().toLowerCase()

  // 2. Fetch all password requests
  const allRequests = await dbGetPasswordRequests(event).catch(() => [])
  const allProjects = await dbGetProjectsRaw(event).catch(() => [])

  // Filter requests belonging to this user
  const clientRequests = allRequests.filter((r: any) => {
    if (r.clientUsername && r.clientUsername === username) return true
    if (r.clientName && r.clientName.includes(`账号: ${username}`)) return true
    if (clientEmail && r.contact && r.contact.toLowerCase().includes(clientEmail)) return true
    return false
  })

  // Set of allowed project slugs (from user profile + approved requests)
  const allowedSlugsSet = new Set<string>(
    (clientProfile.allowedProjects || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
  )

  // Attach calculated password to approved requests & add to allowedSlugsSet
  const enrichedRequests = clientRequests.map((r: any) => {
    const project = allProjects.find((p: any) => p.slug === r.projectSlug)
    let projectPwd = ''
    if (project) {
      if (project.autoRotatePassword !== false) {
        projectPwd = getDailyPassword(project.slug)
      } else {
        projectPwd = project.password || ''
      }
    }

    if (r.status === 'approved') {
      allowedSlugsSet.add(r.projectSlug)
    }

    return {
      ...r,
      password: r.status === 'approved' ? projectPwd : '',
      projectImage: project?.image || ''
    }
  })

  // 3. Build allowed projects list with password included
  const allowedProjects = allProjects
    .filter((p: any) => allowedSlugsSet.has(p.slug))
    .map((p: any) => {
      let pwd = ''
      if (p.autoRotatePassword !== false) {
        pwd = getDailyPassword(p.slug)
      } else {
        pwd = p.password || ''
      }
      return {
        slug: p.slug,
        title: p.title,
        image: p.image,
        description: p.description,
        password: pwd
      }
    })

  return {
    profile: clientProfile,
    allowedProjects,
    requests: enrichedRequests
  }
})
