import path from 'node:path'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from './storage'
import { broadcastAnalyticsChange } from './broadcaster'

export interface SecurityLog {
  id: string
  type: string
  ip: string
  action: string
  timestamp: number
  status: 'blocked' | 'success' | 'warning'
}

function getLogFile(): string {
  return getRuntimeDataPath('security-logs.json')
}

export function getSecurityLogs(): SecurityLog[] {
  try {
    const logFile = getLogFile()
    const logs = readEncryptedJson<SecurityLog[]>(logFile, [])
    return Array.isArray(logs) ? logs : []
  } catch (error) {
    console.error('[SecurityLogger] Error reading logs:', error)
    return []
  }
}

export function logSecurityEvent(log: Omit<SecurityLog, 'id' | 'timestamp'>): SecurityLog | null {
  try {
    const logFile = getLogFile()
    const logs = getSecurityLogs()
    
    const newLog: SecurityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now()
    }

    const updatedLogs = [newLog, ...logs].slice(0, 100) // Keep last 100 logs
    
    // Encrypted write to file
    writeEncryptedJson(logFile, updatedLogs)
    
    // Broadcast change
    try {
      broadcastAnalyticsChange()
    } catch {}
    
    return newLog
  } catch (error) {
    console.error('[SecurityLogger] Error writing log:', error)
    return null
  }
}
