import { recordProjectHeat } from '../../../utils/analytics-store'
import { getD1Database } from '../../../utils/db'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from '../../../utils/storage'
import { assertDeliveryAccess } from '../../../utils/delivery-access'
import { getRealClientIP } from '../../../utils/ip-helper'
import { checkRateLimit, recordFailedAttempt } from '../../../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  const ip = getRealClientIP(event)
  const rateLimitKey = `view-count:${ip}`
  const { isLocked } = checkRateLimit(rateLimitKey)
  if (isLocked) {
    return { ok: false, message: 'Rate limited' }
  }
  // Allow max 30 view increment recordings per minute per IP
  recordFailedAttempt(rateLimitKey, 30, 60)

  const slug = String(getRouterParam(event, 'slug') || (event.path || '').split('/')[3]?.split('?')[0] || '')
    .trim().replace(/^\/+|\/+$/g, '').split('/')[0].toLowerCase()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing project slug' })

  const cleanSlug = slug.replace(/^\/(projects|blog)\//, '').split('/')[0].split('?')[0]
  if (!cleanSlug || cleanSlug === 'projects' || cleanSlug === 'get') {
    return { ok: false, message: 'Invalid slug' }
  }

  // View analytics are also a project access surface. Anonymous visitors keep
  // the existing public tracking behavior; client sessions are checked against
  // their assigned delivery projects before anything is recorded.
  await assertDeliveryAccess(event, cleanSlug)

  // 1. Record heat in persistent storage (project-heat.json / D1)
  recordProjectHeat(cleanSlug, 1)

  // 2. Also record page view / analytics event
  const today = new Date().toISOString().slice(0, 10)
  const db = await getD1Database(event)
  const projectPath = `/projects/${cleanSlug}`

  if (db) {
    await db.prepare(`
      INSERT INTO page_views (path, date, count) VALUES (?, ?, 1)
      ON CONFLICT(path, date) DO UPDATE SET count = count + 1
    `).bind(projectPath, today).run().catch(() => {})
  } else {
    const statsFile = getRuntimeDataPath('page-views.json')
    const stats = readEncryptedJson<Record<string, Record<string, number>>>(statsFile, {})
    if (!stats[projectPath]) stats[projectPath] = {}
    stats[projectPath][today] = (stats[projectPath][today] || 0) + 1
    writeEncryptedJson(statsFile, stats)
  }

  return { ok: true, slug: cleanSlug }
})
