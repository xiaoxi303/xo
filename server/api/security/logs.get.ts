import { getSecurityLogs } from '../../utils/security-logger'
import { requireAdminSession } from '../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const logs = getSecurityLogs()
  return {
    success: true,
    logs,
    blockedCount: logs.filter(l => l.status === 'blocked').length
  }
})
