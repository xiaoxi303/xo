import { getD1Database } from '../../utils/db'
import fs from 'node:fs'
import { getRuntimeDataPath } from '../../utils/storage'

import { readBody, readRawBody, createError, defineEventHandler } from 'h3'

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

  if (db) {
    await db.prepare('INSERT INTO analytics_events (event, meta) VALUES (?, ?)').bind(eventName, metaStr).run()
  } else {
    // Local fallback: append to content/events.json
    const eventsFile = getRuntimeDataPath('events.json')
    let events: any[] = []
    if (fs.existsSync(eventsFile)) {
      try { events = JSON.parse(fs.readFileSync(eventsFile, 'utf-8')) } catch {}
    }
    events.push({ event: eventName, meta: metaStr, ts: new Date().toISOString() })
    // Keep last 1000 events
    if (events.length > 1000) events = events.slice(-1000)
    fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
  }

  return { ok: true }
})
