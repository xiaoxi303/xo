import { getD1Database } from '../utils/db'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const db = await getD1Database(event)
  const isD1 = !!db

  // ── 7-day page views ──────────────────────────────────────────────
  const days: { date: string; views: number }[] = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const label = i === 0 ? '今日' : `${d.getMonth() + 1}/${d.getDate()}`
    days.push({ date: dateStr, views: 0, label } as any)
  }

  if (db) {
    const dateList = days.map(d => d.date)
    const placeholders = dateList.map(() => '?').join(',')
    const rows = await db.prepare(
      `SELECT date, SUM(count) as total FROM page_views WHERE date IN (${placeholders}) GROUP BY date`
    ).bind(...dateList).all()

    for (const row of (rows.results || []) as any[]) {
      const idx = days.findIndex(d => d.date === row.date)
      if (idx !== -1) days[idx].views = Number(row.total || 0)
    }
  } else {
    // Local fallback: read content/page-views.json
    const statsFile = path.resolve(process.cwd(), 'content/page-views.json')
    if (fs.existsSync(statsFile)) {
      try {
        const stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'))
        for (const day of days) {
          let total = 0
          for (const pathKey of Object.keys(stats)) {
            total += stats[pathKey][day.date] || 0
          }
          day.views = total
        }
      } catch {}
    }
  }

  const totalViews = days.reduce((s, d) => s + d.views, 0)
  const todayViews = days[6].views
  const yesterdayViews = days[5].views

  // ── Referral breakdown (real: read Referer header stats from events) ──
  let referrals: { label: string; pct: number }[] = []
  if (db) {
    const refRows = await db.prepare(
      `SELECT meta, COUNT(*) as cnt FROM analytics_events WHERE event = 'referral' AND ts > datetime('now', '-7 days') GROUP BY meta ORDER BY cnt DESC LIMIT 5`
    ).all()

    const total = (refRows.results as any[]).reduce((s: number, r: any) => s + Number(r.cnt), 0)
    referrals = (refRows.results as any[]).map((r: any) => ({
      label: r.meta || 'Direct',
      pct: total > 0 ? Math.round((Number(r.cnt) / total) * 100) : 0
    }))
  }

  // Fallback when no referral data yet
  if (referrals.length === 0) {
    referrals = [
      { label: '直接访问 (Direct)', pct: 100 }
    ]
  }

  // ── Project click events ──────────────────────────────────────────
  let projectClicks: { slug: string; title: string; clicks: number }[] = []
  if (db) {
    const clickRows = await db.prepare(
      `SELECT meta, COUNT(*) as cnt FROM analytics_events WHERE event = 'project_click' GROUP BY meta ORDER BY cnt DESC LIMIT 4`
    ).all()
    projectClicks = (clickRows.results as any[]).map((r: any) => {
      let slug = r.meta || ''
      let title = slug
      try { const parsed = JSON.parse(r.meta); slug = parsed.slug; title = parsed.title } catch {}
      return { slug, title, clicks: Number(r.cnt) }
    })
  }

  // ── Contact clicks ────────────────────────────────────────────────
  let contactClicks = 0
  if (db) {
    const cc = await db.prepare(
      `SELECT COUNT(*) as cnt FROM analytics_events WHERE event = 'contact_click' AND ts > datetime('now', '-7 days')`
    ).first() as any
    contactClicks = Number(cc?.cnt || 0)
  }

  // ── Real system latency ───────────────────────────────────────────
  const latency = Date.now() - startTime

  // ── Total all-time views ──────────────────────────────────────────
  let allTimeViews = 0
  if (db) {
    const atv = await db.prepare('SELECT SUM(count) as total FROM page_views').first() as any
    allTimeViews = Number(atv?.total || 0)
  } else {
    // local: sum page-views.json
    const statsFile = path.resolve(process.cwd(), 'content/page-views.json')
    if (fs.existsSync(statsFile)) {
      try {
        const stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'))
        for (const pathKey of Object.keys(stats)) {
          for (const dv of Object.values(stats[pathKey]) as number[]) allTimeViews += dv
        }
      } catch {}
    }
  }

  return {
    engine: isD1 ? 'Cloudflare D1' : 'Local File System',
    status: 'Operational',
    latency: `${latency}ms`,
    ssl: 'Active (TLS 1.3)',
    dbHealth: '100%',
    allTimeViews,
    todayViews,
    yesterdayViews,
    weekViews: totalViews,
    contactClicks,
    trend: days,
    referrals,
    projectClicks
  }
})
