import { dbGetProjectsRaw } from '../../utils/db'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { getDailyPassword } from '../../utils/password-utils'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  const session = token ? validateSession(token) : null

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Please login first.' })
  }

  try {
    const projects = await dbGetProjectsRaw(event)
    
    // Add activePassword for admin overview
    const projectsWithPassword = projects.map(project => {
      const identifier = project.slug || project.id || ''
      const isLocked = Boolean(project.isPasswordProtected)
      
      let activePassword = project.password || ''
      if (isLocked && project.autoRotatePassword) {
        activePassword = getDailyPassword(identifier)
      }
      
      return {
        ...project,
        isPasswordProtected: isLocked,
        activePassword: activePassword || 'Not set'
      }
    })
    
    return projectsWithPassword
  } catch (error) {
    console.error('Failed to read admin projects:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to read projects.' })
  }
})
