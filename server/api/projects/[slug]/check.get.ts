/**
 * GET /api/projects/:slug/check
 * Returns whether the current visitor has a valid unlock cookie for this project,
 * and whether the project requires a password at all.
 */
import { dbGetProjectPassword } from '../../../utils/db'
import { validateUnlockToken } from './unlock.post'
import { recordProjectHeat } from '../../../utils/analytics-store'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || (event.path || '').split('/')[3]?.split('?')[0]
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug.' })

  // Record project heat visit instantly when entering project page in SPA or direct mode
  recordProjectHeat(slug, 1)

  const storedPassword = await dbGetProjectPassword(event, slug)

  // No password set — project is public
  if (!storedPassword || storedPassword.trim() === '') {
    return { hasPassword: false, unlocked: true }
  }

  // Check unlock cookie
  const token = getCookie(event, `unlock_${slug}`)
  if (token && validateUnlockToken(slug, token)) {
    return { hasPassword: true, unlocked: true }
  }

  return { hasPassword: true, unlocked: false }
})
