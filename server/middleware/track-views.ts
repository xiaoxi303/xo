import { getD1Database } from '../utils/db'
import fs from 'node:fs'
import { getRuntimeDataPath } from '../utils/storage'

// Pages we want to track (skip assets, api routes, admin)
const TRACKABLE_PATHS = ['/', '/projects', '/about']

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only track HTML page requests (not API, assets, etc.)
  if (!TRACKABLE_PATHS.some(p => pathname === p || pathname.startsWith('/projects/'))) return
  if (pathname.startsWith('/api/') || pathname.startsWith('/_nuxt/') || pathname.startsWith('/uploads/')) return

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  try {
    const db = await getD1Database(event)

    if (db) {
      // D1: upsert row (increment count for path+date)
      await db.prepare(`
        INSERT INTO page_views (path, date, count) VALUES (?, ?, 1)
        ON CONFLICT(path, date) DO UPDATE SET count = count + 1
      `).bind(pathname, today).run().catch(async () => {
        // If UNIQUE constraint not set up yet, use two-step
        const row = await db.prepare('SELECT id, count FROM page_views WHERE path = ? AND date = ?').bind(pathname, today).first() as any
        if (row) {
          await db.prepare('UPDATE page_views SET count = ? WHERE id = ?').bind(row.count + 1, row.id).run()
        } else {
          await db.prepare('INSERT INTO page_views (path, date, count) VALUES (?, ?, 1)').bind(pathname, today).run()
        }
      })
    } else {
      // Local fallback: JSON file
      const statsFile = getRuntimeDataPath('page-views.json')

      let stats: Record<string, Record<string, number>> = {}
      if (fs.existsSync(statsFile)) {
        try { stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8')) } catch {}
      }

      if (!stats[pathname]) stats[pathname] = {}
      stats[pathname][today] = (stats[pathname][today] || 0) + 1

      fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2))
    }
  } catch (e) {
    // Silently swallow tracking errors — never break pages
  }
})
