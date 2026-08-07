import { getCookie } from 'h3'
import { randomBytes } from 'node:crypto'
import {
  dbGetUserRecord,
  dbGetUsers,
  dbEnsureUserDeliveryCredentials,
  dbUpdateUser
} from '../../../utils/db'
import { SESSION_COOKIE, validateSession } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const adminToken = getCookie(event, SESSION_COOKIE)
  if (!adminToken || !validateSession(adminToken)) {
    throw createError({ statusCode: 401, statusMessage: '未授权的后台请求。' })
  }

  const body = await readBody(event).catch(() => ({})) as any
  const userId = String(body?.id || '').trim()
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: '缺少客户账号 ID。' })
  }

  const users = await dbGetUsers(event)
  const listedUser = users.find((user: any) => String(user.id) === userId)
  if (!listedUser?.username) {
    throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
  }

  const user = await dbGetUserRecord(event, listedUser.username)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
  }
  if (user.isBlacklisted) {
    throw createError({ statusCode: 403, statusMessage: '该客户账号已被拉黑，无法生成交付密钥。' })
  }

  const existing = await dbEnsureUserDeliveryCredentials(event, user)
  const deliveryKey = `dk_${randomBytes(18).toString('hex')}`
  await dbUpdateUser(event, user.id ?? userId, {
    deliveryKey,
    deliverySuffix: existing?.deliverySuffix || user.deliverySuffix || user.username
  })

  const refreshed = await dbGetUserRecord(event, user.username)
  return {
    success: true,
    deliverySuffix: refreshed?.deliverySuffix || existing?.deliverySuffix || user.username,
    deliveryKey,
    keyHint: refreshed?.deliveryKeyHint || deliveryKey.slice(-4),
    oneTime: true
  }
})
