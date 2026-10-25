import { dbUpdateUser } from '../../utils/db'
import { hashPassword, validateSession, SESSION_COOKIE, destroyAllUserSessions } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const body = await readBody(event)
  const {
    id,
    email,
    role,
    allowedProjects,
    password,
    wechat,
    isWhitelisted,
    isBlacklisted,
    deliverySuffix,
    deliveryKey,
    deliveryKeyHash,
    warningCount,
    blacklistReason,
    blacklistedAt
  } = body || {}

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少用户 ID。'
    })
  }

  const updateData: any = {
    email: email ? email.trim() : '',
    wechat: wechat ? wechat.trim() : '',
    role: role || 'client',
    allowedProjects: allowedProjects || '',
    isWhitelisted: isWhitelisted !== undefined ? !!isWhitelisted : undefined,
    isBlacklisted: isBlacklisted !== undefined ? !!isBlacklisted : undefined,
    deliverySuffix: deliverySuffix !== undefined ? String(deliverySuffix).trim() : undefined,
    deliveryKey: deliveryKey !== undefined ? String(deliveryKey).trim() : undefined,
    deliveryKeyHash: deliveryKeyHash !== undefined ? String(deliveryKeyHash).trim() : undefined,
    warningCount: warningCount !== undefined ? Number(warningCount) : undefined,
    blacklistReason: blacklistReason !== undefined ? String(blacklistReason).trim() : undefined,
    blacklistedAt: blacklistedAt !== undefined ? blacklistedAt : undefined
  }

  if (password && password.trim()) {
    const pw = password.trim()
    if (pw.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: '新密码不能少于 6 个字符。'
      })
    }
    updateData.password = hashPassword(pw)
  }

  try {
    await dbUpdateUser(event, id, updateData)

    // 若拉黑用户，立即吊销该用户所有活跃会话
    if (isBlacklisted === true) {
      const { dbGetUsers } = await import('../../utils/db')
      const users = await dbGetUsers(event).catch(() => [])
      const u = users.find((item: any) => String(item.id) === String(id))
      if (u?.username) {
        destroyAllUserSessions(u.username)
      }
    }

    // 若解除拉黑，同步清除频率限制与 blacklist.json 中的条目
    if (isBlacklisted === false) {
      const { dbGetUsers, dbRemoveBlacklist } = await import('../../utils/db')
      const { resetRateLimit } = await import('../../utils/rate-limiter')
      const users = await dbGetUsers(event).catch(() => [])
      const u = users.find((item: any) => String(item.id) === String(id))
      if (u) {
        resetRateLimit(`client-user:${u.username}`)
        if (u.email) resetRateLimit(`client-user:${u.email}`)
        await dbRemoveBlacklist(event, u.username).catch(() => {})
        if (u.email) await dbRemoveBlacklist(event, u.email).catch(() => {})
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to update user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新用户资料与权限失败。'
    })
  }
})
