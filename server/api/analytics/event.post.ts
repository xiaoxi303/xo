import { getD1Database } from '../../utils/db'
import fs from 'node:fs'
import { getRuntimeDataPath } from '../../utils/storage'
import { readBody, readRawBody, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  let body: any = null
  try {
    body = await readBody(event)
  } catch {}

  if (!body || typeof body !== 'object') {
    try {
      const raw = await readRawBody(event, 'utf-8')
      if (raw) body = JSON.parse(raw)
    } catch {}
  }

  const { event: eventName, meta } = body || {}

  if (!eventName) return { ok: false, message: 'Missing event name' }

  const db = await getD1Database(event)
  const metaStr = typeof meta === 'string' ? meta : JSON.stringify(meta || {})

  let targetSlug = ''
  if (typeof meta === 'object' && meta !== null) {
    targetSlug = (meta as any).slug || ''
  } else if (typeof meta === 'string') {
    try {
      const parsed = JSON.parse(meta)
      targetSlug = parsed.slug || meta
    } catch {
      targetSlug = meta
    }
  }

  if (targetSlug) {
    targetSlug = targetSlug.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
  }

  const today = new Date().toISOString().slice(0, 10)

  if (db) {
    await db.prepare('INSERT INTO analytics_events (event, meta) VALUES (?, ?)').bind(eventName, metaStr).run().catch(() => {})
    if (targetSlug && targetSlug !== 'get') {
      const projectPath = `/projects/${targetSlug}`
      await db.prepare(`
        INSERT INTO page_views (path, date, count) VALUES (?, ?, 1)
        ON CONFLICT(path, date) DO UPDATE SET count = count + 1
      `).bind(projectPath, today).run().catch(() => {})
    }
  } else {
    // Local fallback: append to content/events.json
    const eventsFile = getRuntimeDataPath('events.json')
    let events: any[] = []
    if (fs.existsSync(eventsFile)) {
      try { events = JSON.parse(fs.readFileSync(eventsFile, 'utf-8')) } catch {}
    }
    events.push({ event: eventName, meta: metaStr, ts: new Date().toISOString() })
    if (events.length > 1000) events = events.slice(-1000)
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))

    // ALSO update content/page-views.json for instant local stats synchronization
    if (targetSlug && targetSlug !== 'get') {
      const projectPath = `/projects/${targetSlug}`
      const statsFile = getRuntimeDataPath('page-views.json')
      let stats: Record<string, Record<string, number>> = {}
      if (fs.existsSync(statsFile)) {
        try { stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8')) } catch {}
      }
      if (!stats[projectPath]) stats[projectPath] = {}
      stats[projectPath][today] = (stats[projectPath][today] || 0) + 1
      fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2))
    }
  }

  return { ok: true }
})
