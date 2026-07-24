# -*- coding: utf-8 -*-
import codecs

# Rewrite the security logger with simpler, more robust code
new_content = '''import fs from 'node:fs'
import path from 'node:path'
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

function getLogFile(): string {
  return getRuntimeDataPath('security-logs.json')
}

export function getSecurityLogs(): SecurityLog[] {
  try {
    const logFile = getLogFile()
    if (!fs.existsSync(logFile)) {
      // Create empty file
      fs.writeFileSync(logFile, '[]', 'utf-8')
      return []
    }

    const content = fs.readFileSync(logFile, 'utf-8')
    if (!content || content.trim() === '') {
      return []
    }
    
    const logs = JSON.parse(content)
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
    
    // Ensure directory exists
    const dir = path.dirname(logFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Write to file
    fs.writeFileSync(logFile, JSON.stringify(updatedLogs, null, 2), 'utf-8')
    
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
'''

with codecs.open(r'D:\Git\zpj\server\utils\security-logger.ts', 'w', 'utf-8') as f:
    f.write(new_content)

print("Rewrote security-logger.ts")
