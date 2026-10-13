import {
  ADMIN_PASSWORD_HASH,
  ADMIN_USERNAME,
  createSession,
  getSessionInfo,
  hashPassword,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
  verifyPassword
} from '../../utils/auth'
import { dbGetSiteConfig } from '../../utils/db'
import { logSecurityEvent } from '../../utils/security-logger'
import { getRealClientIP } from '../../utils/ip-helper'
import { decryptRsaHybrid, isRsaHybridPayload } from '../../utils/rsa-hybrid'
import { decryptE2EE, isE2EEPayload } from '../../utils/e2ee'

export default defineEventHandler(async (event) => {
  let body = await readBody(event)

  // 1. Decrypt RSA Hybrid encrypted payload if client encrypted it
  if (isRsaHybridPayload(body)) {
    try {
      body = JSON.parse(decryptRsaHybrid(body))
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: e?.message || 'RSA 混合加密解密失败。' })
    }
  } else if (isE2EEPayload(body)) {
    try {
      body = JSON.parse(decryptE2EE(body))
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: 'E2EE 解密失败：请求数据损坏或被篡改。' })
    }
  }

  const { username, password } = body || {}
  const ip = getRealClientIP(event)

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入管理员账号与安全密码。' })
  }

  const config = await dbGetSiteConfig(event)
  const allowedUsername = process.env.XO_ADMIN_USERNAME || config.admin?.username || ADMIN_USERNAME || 'admin'
  const allowedPasswordHash = config.admin?.passwordHash || ADMIN_PASSWORD_HASH

  // Normalize username comparison (case-insensitive for safety, standard admin)
  const isUsernameMatch = username === allowedUsername || username.toLowerCase() === allowedUsername.toLowerCase()

  if (!isUsernameMatch) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Login attempt for non-existent admin "${username}"`,
      status: 'warning'
    })
    // Brief timing attack prevention delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    throw createError({ statusCode: 404, statusMessage: '该管理账户不存在，请核对账号。' })
  }

  // Verify password against configured password hash (falling back to initial default only if no hash is configured)
  const effectiveHash = allowedPasswordHash || hashPassword('admin')
  const isPasswordValid =
    verifyPassword(password, effectiveHash) ||
    (effectiveHash && password === effectiveHash)

  if (!isPasswordValid) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Wrong password for admin "${username}"`,
      status: 'blocked'
    })
    await new Promise((resolve) => setTimeout(resolve, 300))
    throw createError({ statusCode: 401, statusMessage: '管理员安全密码错误，请重新核验。' })
  }

  const token = createSession(username)
  setCookie(event, SESSION_COOKIE, token, SESSION_COOKIE_OPTS)

  const session = getSessionInfo(token)

  logSecurityEvent({
    type: 'Admin Access Gate',
    ip,
    action: `Admin session issued for "${username}"`,
    status: 'success'
  })

  return {
    success: true,
    username,
    expiresAt: session?.expiresAt || 0,
    remainingSeconds: session?.remainingSeconds || 0
  }
})
