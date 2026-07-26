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
    
    // Add todayPassword for admin overview
    const projectsWithPassword = projects.map(project => {
      let todayPassword = project.password || ''
      
      // If auto-rotate is enabled, calculate today's dynamic password
      if (project.isPasswordProtected && project.autoRotatePassword) {
        todayPassword = getDailyPassword(project.slug)
      }
      
      return {
        ...project,
        todayPassword
      }
    })
    
    return projectsWithPassword
  } catch (error) {
    console.error('Failed to read admin projects:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to read projects.' })
  }
})
