import { dbGetBlacklist, dbGetUserRecord } from '../../utils/db'
import { verifyPassword, createSession, getSessionInfo, CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'
import { logSecurityEvent } from '../../utils/security-logger'
import { getRealClientIP } from '../../utils/ip-helper'

import { isE2EEPayload, decryptE2EE } from '../../utils/e2ee'

export default defineEventHandler(async (event) => {
  let body = await readBody(event)

  // Handle E2EE payload decryption if client sent E2EE encrypted request
  if (isE2EEPayload(body)) {
    try {
      const decryptedString = decryptE2EE(body)
      body = JSON.parse(decryptedString)
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: 'E2EE 解密失败：请求数据损坏或被篡改。' })
    }
  }

  const { username, password } = body || {}
  const ip = getRealClientIP(event)

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码。' })
  }

  // Retrieve the raw user record (including password hash) through the shared D1/JSON adapter.
  const userRecord: any = await dbGetUserRecord(event, username)

  if (!userRecord) {
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Login attempt for non-existent user "${username}"`,
      status: 'warning'
    })
    // Artificial delay to prevent brute force timing attacks
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 404, statusMessage: '该账户不存在，请先注册。' })
  }

  // A blacklisted account cannot create a new client session.
  const blacklist = await dbGetBlacklist(event).catch(() => [])
  const usernameValue = String(userRecord.username || username).toLowerCase()
  const emailValue = String(userRecord.email || '').toLowerCase()
  const listed = blacklist.some((item: any) => {
    const value = String(item?.value || '').trim().toLowerCase()
    if (!value) return false
    const type = String(item?.type || '').toLowerCase()
    if (type === 'email' || type === 'mail') return value === emailValue
    return value === usernameValue || value === emailValue
  })
  if (userRecord.isBlacklisted || listed) {
    const matchingEntry = blacklist.find((item: any) => {
      const value = String(item?.value || '').trim().toLowerCase()
      return value && (value === usernameValue || value === emailValue)
    })
    const reason = userRecord.blacklistReason || matchingEntry?.reason || 'Account access has been blocked.'
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Blocked login for blacklisted user "${username}" (${reason})`,
      status: 'blocked'
    })
    throw createError({ statusCode: 403, statusMessage: reason })
  }

  // Verify client password
  if (!verifyPassword(password, userRecord.password)) {
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Wrong password for user "${username}"`,
      status: 'blocked'
    })
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '密码错误，请重新输入。' })
  }

  // Create session and set cookie
  const token = createSession(username)
  setCookie(event, CLIENT_SESSION_COOKIE, token, SESSION_COOKIE_OPTS)
  const session = getSessionInfo(token)

  logSecurityEvent({
    type: 'Client Access Gate',
    ip,
    action: `Client session issued for "${username}"`,
    status: 'success'
  })

  return {
    success: true,
    username: userRecord.username,
    role: userRecord.role,
    deliverySuffix: userRecord.deliverySuffix || '',
    deliveryKeyHint: userRecord.deliveryKeyHint || '',
    expiresAt: session?.expiresAt || 0,
    remainingSeconds: session?.remainingSeconds || 0
  }
})
