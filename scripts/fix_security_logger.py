# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\utils\security-logger.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Add better error handling and logging
old_log_function = '''export function logSecurityEvent(log: Omit<SecurityLog, 'id' | 'timestamp'>) {
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
}'''

new_log_function = '''export function logSecurityEvent(log: Omit<SecurityLog, 'id' | 'timestamp'>) {
  try {
    const logs = getSecurityLogs()
    const newLog: SecurityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now()
    }

    const updatedLogs = [newLog, ...logs].slice(0, 50)
    const jsonContent = JSON.stringify(updatedLogs, null, 2)
    
    // Ensure directory exists
    const dir = require('path').dirname(LOG_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(LOG_FILE, jsonContent, 'utf-8')
    
    // Verify write
    if (fs.existsSync(LOG_FILE)) {
      const verifyContent = fs.readFileSync(LOG_FILE, 'utf-8')
      console.log(`[SecurityLogger] Wrote ${updatedLogs.length} logs to ${LOG_FILE} (${verifyContent.length} bytes)`)
    }
    
    broadcastAnalyticsChange()
    return newLog
  } catch (error) {
    console.error('[SecurityLogger] Failed to write log:', error)
    return null
  }
}'''

if old_log_function in content:
    content = content.replace(old_log_function, new_log_function)
    print("Updated logSecurityEvent function")
else:
    print("Function not found")

# Write the file
with codecs.open(r'D:\Git\zpj\server\utils\security-logger.ts', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
