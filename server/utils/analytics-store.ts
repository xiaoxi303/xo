import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'
import { broadcastAnalyticsChange } from './broadcaster'

export function recordProjectHeat(slug: string, count: number = 1) {
  if (!slug) return
  const cleanSlug = slug.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
  if (!cleanSlug || cleanSlug === 'projects' || cleanSlug === 'get') return

  const heatFile = getRuntimeDataPath('project-heat.json')
  const statsFile = getRuntimeDataPath('page-views.json')
  let heat: Record<string, number> = {}

  if (fs.existsSync(heatFile)) {
    try {
      heat = JSON.parse(fs.readFileSync(heatFile, 'utf-8'))
    } catch {}
  }

  let currentViews = 0
  if (fs.existsSync(statsFile)) {
    try {
      const stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'))
      const projectPath = `/projects/${cleanSlug}`
      if (stats[projectPath]) {
        currentViews = Object.values(stats[projectPath]).reduce((sum: number, n: any) => sum + Number(n || 0), 0)
      }
    } catch {}
  }

  const baseline = Math.max(heat[cleanSlug] || 0, currentViews)
  heat[cleanSlug] = baseline + count
  fs.writeFileSync(heatFile, JSON.stringify(heat, null, 2))

  // Broadcast instant real-time SSE push to all open admin dashboards
  try {
    broadcastAnalyticsChange()
  } catch {}
}

export function getProjectHeatMap(): Record<string, number> {
  const heatFile = getRuntimeDataPath('project-heat.json')
  if (fs.existsSync(heatFile)) {
    try {
      return JSON.parse(fs.readFileSync(heatFile, 'utf-8'))
    } catch {}
  }
  return {}
}
