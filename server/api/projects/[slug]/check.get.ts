/**
 * GET /api/projects/:slug/check
 * Returns whether the current visitor has a valid unlock cookie for this project,
 * and whether the project requires a password at all.
 * Supports both static and daily rotating passwords.
 */
import { dbGetProject } from '../../../utils/db'
import { validateUnlockToken } from './unlock.post'
import { generateDailyPassword, getCurrentDateString } from '../../../utils/password'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || (event.path || '').split('/')[3]?.split('?')[0]
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  // Get project info
  const project = await dbGetProject(event, slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: '作品不存在。' })

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
  const token = getCookie(event, `unlock_${slug}`)
  if (token && validateUnlockToken(slug, token)) {
    return { 
      hasPassword: true, 
      unlocked: true,
      autoRotate: project.autoRotatePassword,
      passwordHint: project.autoRotatePassword ? '密码每日凌晨 00:00 自动更新' : null
    }
  }

  return { 
    hasPassword: true, 
    unlocked: false,
    autoRotate: project.autoRotatePassword,
    passwordHint: project.autoRotatePassword ? '密码每日凌晨 00:00 自动更新' : null
  }
})
