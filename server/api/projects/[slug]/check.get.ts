/**
 * GET /api/projects/:slug/check
 * Check unlock status and password protection settings
 */
import { dbGetProjectsRaw } from '../../../utils/db'
import { validateUnlockToken } from './unlock.post'
import { generateDailyPassword, getBeijingDateString } from '../../../utils/password-utils'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || (event.path || '').split('/')[3]?.split('?')[0] || '')
    .trim().replace(/^\/+|\/+$/g, '').split('/')[0].toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  const projects = await dbGetProjectsRaw(event)
  const project = projects.find((p: any) => p.slug === slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found.' })

  // Check if project is password protected
  if (!project.isPasswordProtected) {
    return { 
      hasPassword: false, 
      unlocked: true,
      autoRotate: false,
      passwordHint: null
    }
  }

  // Check unlock cookie
  const token = getCookie(event, 'unlock_' + slug)
  if (token && validateUnlockToken(slug, token)) {
    return { 
      hasPassword: true, 
      unlocked: true,
      autoRotate: project.autoRotatePassword,
      passwordHint: project.autoRotatePassword ? 'Password updates daily at 00:00' : null
    }
  }

  return { 
    hasPassword: true, 
    unlocked: false,
    autoRotate: project.autoRotatePassword,
    passwordHint: project.autoRotatePassword ? 'Password updates daily at 00:00' : null
  }
})
