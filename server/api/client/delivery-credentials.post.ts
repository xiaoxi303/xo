import { getCookie } from 'h3'
import { randomBytes } from 'node:crypto'
import {
  CLIENT_SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
  getSessionInfo
} from '../../utils/auth'
import {
  dbGetUserRecord,
  dbUpdateUser,
  dbEnsureUserDeliveryCredentials
} from '../../utils/db'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  const session = token ? getSessionInfo(token) : null
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '请先登录客户账号。' })
  }

  const user = await dbGetUserRecord(event, session.username)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
  }
  if (user.isBlacklisted) {
    setCookie(event, CLIENT_SESSION_COOKIE, '', { ...SESSION_COOKIE_OPTS, maxAge: -1 })
    throw createError({ statusCode: 403, statusMessage: '账号已被拉黑，无法管理交付密钥。' })
  }

  const body = await readBody(event).catch(() => ({})) as any
  const rotate = body?.rotate !== false
  const existing = await dbEnsureUserDeliveryCredentials(event, user)
  let deliveryKey = ''

  if (rotate || !existing?.deliveryKeyHash) {
    deliveryKey = `dk_${randomBytes(18).toString('hex')}`
    await dbUpdateUser(event, user.id, {
      deliveryKey,
      deliverySuffix: existing?.deliverySuffix || user.deliverySuffix || session.username
    })
  }

  const refreshed = await dbGetUserRecord(event, session.username)
  return {
    success: true,
    deliverySuffix: refreshed?.deliverySuffix || existing?.deliverySuffix || session.username,
    deliveryKey,
    keyHint: refreshed?.deliveryKeyHint || existing?.deliveryKeyHint || (deliveryKey ? deliveryKey.slice(-4) : ''),
    oneTime: Boolean(deliveryKey),
    message: deliveryKey
      ? '请立即复制并妥善保存密钥。系统只在本次显示完整密钥。'
      : '密钥已存在。为安全起见，完整密钥只会在生成或轮换后显示。'
  }
})
