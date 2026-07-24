import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'
import { broadcastAnalyticsChange } from './broadcaster'

export interface SecurityLog {
  id: string
  type: string
  ip: string
  action: string
  timestamp: number
  status: 'blocked' | 'success' | 'warning'
}

const LOG_FILE = getRuntimeDataPath('security-logs.json')

export function getSecurityLogs(): SecurityLog[] {
  try {
    if (!fs.existsSync(LOG_FILE)) return []

    const content = fs.readFileSync(LOG_FILE, 'utf-8')
    const logs = JSON.parse(content)
    return Array.isArray(logs) ? logs : []
  } catch {
    return []
  }
}

export function logSecurityEvent(log: Omit<SecurityLog, 'id' | 'timestamp'>) {
  try {
    const logs = getSecurityLogs()
    const newLog: SecurityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now()
    }

    fs.writeFileSync(LOG_FILE, JSON.stringify([newLog, ...logs].slice(0, 50), null, 2))
    broadcastAnalyticsChange()
    return newLog
  } catch {
    return null
  }
}
