import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from './storage'
import { broadcastAnalyticsChange } from './broadcaster'

export function recordProjectHeat(slug: string, count: number = 1) {
  if (!slug) return
  const cleanSlug = slug.replace(/^\/(projects|blog)\//, '').split('/')[0].split('?')[0]
  if (!cleanSlug || cleanSlug === 'projects' || cleanSlug === 'get') return

  const heatFile = getRuntimeDataPath('project-heat.json')
  const statsFile = getRuntimeDataPath('page-views.json')
  
  const heat = readEncryptedJson<Record<string, number>>(heatFile, {})

  let currentViews = 0
  const stats = readEncryptedJson<Record<string, Record<string, number>>>(statsFile, {})
  const projectPath = `/projects/${cleanSlug}`
  if (stats[projectPath]) {
    currentViews = Object.values(stats[projectPath]).reduce((sum: number, n: any) => sum + Number(n || 0), 0)
  }

  const baseline = Math.max(heat[cleanSlug] || 0, currentViews)
  heat[cleanSlug] = baseline + count
  writeEncryptedJson(heatFile, heat)

  // Broadcast instant real-time SSE push to all open admin dashboards
  try {
    broadcastAnalyticsChange()
  } catch {}
}

export function getProjectHeatMap(): Record<string, number> {
  const heatFile = getRuntimeDataPath('project-heat.json')
  return readEncryptedJson<Record<string, number>>(heatFile, {})
}
