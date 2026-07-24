import fs from 'node:fs'
import { defineEventHandler, getCookie } from 'h3'
import { CLIENT_SESSION_COOKIE, getSessionInfo, SESSION_COOKIE } from '../../utils/auth'
import { getSecurityLogs } from '../../utils/security-logger'
import { getRuntimeDataPath } from '../../utils/storage'

function formatDiskStatus() {
  const logsPath = getRuntimeDataPath('security-logs.json')
  const exists = fs.existsSync(logsPath)
  const bytes = exists ? fs.statSync(logsPath).size : 0
  return exists
    ? `JSON 日志文件就绪 (${bytes} bytes)`
    : '暂无安全日志文件'
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  const clientToken = getCookie(event, CLIENT_SESSION_COOKIE)
  const session = token ? getSessionInfo(token) : null
  const clientSession = clientToken ? getSessionInfo(clientToken) : null
  const logs = getSecurityLogs()

  return {
    success: true,
    clientSession: clientSession
      ? {
          loggedIn: true,
          username: clientSession.username,
          createdAt: clientSession.createdAt,
          expiresAt: clientSession.expiresAt,
          remainingSeconds: clientSession.remainingSeconds
        }
      : {
          loggedIn: false,
          username: '',
          createdAt: 0,
          expiresAt: 0,
          remainingSeconds: 0
        },
    session: session
      ? {
          loggedIn: true,
          username: session.username,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          remainingSeconds: session.remainingSeconds
        }
      : {
          loggedIn: false,
          username: '',
          createdAt: 0,
          expiresAt: 0,
          remainingSeconds: 0
        },
    totalBlocked: logs.filter((log) => log.status === 'blocked').length,
    diskStatus: formatDiskStatus(),
    logs
  }
})
