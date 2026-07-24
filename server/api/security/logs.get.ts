import { getSecurityLogs } from '../../utils/security-logger'

export default defineEventHandler(async (event) => {
  const logs = getSecurityLogs()
  return {
    success: true,
    logs,
    blockedCount: logs.filter(l => l.status === 'blocked').length
  }
})
