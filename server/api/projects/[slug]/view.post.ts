import { recordProjectHeat } from '../../../utils/analytics-store'
import { getD1Database } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || (event.path || '').split('/')[3]?.split('?')[0]
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing project slug' })

  const cleanSlug = slug.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
  if (!cleanSlug || cleanSlug === 'projects' || cleanSlug === 'get') {
    return { ok: false, message: 'Invalid slug' }
  }

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
    let stats: Record<string, Record<string, number>> = {}
    if (fs.existsSync(statsFile)) {
      try { stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8')) } catch {}
    }
    if (!stats[projectPath]) stats[projectPath] = {}
    stats[projectPath][today] = (stats[projectPath][today] || 0) + 1
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2))
  }

  return { ok: true, slug: cleanSlug }
})
