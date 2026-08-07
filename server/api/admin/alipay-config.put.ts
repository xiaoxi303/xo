import crypto from 'node:crypto'
import { getCookie } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { normalizePrivateKey, publicAlipayConfig, saveAlipayConfig } from '../../utils/alipay'

export default defineEventHandler(async event => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权的后台请求' })
  const body = await readBody(event).catch(() => ({})) as any
  const appId = String(body.appId || '').trim()
  const enabled = Boolean(body.enabled)
  if (enabled && !appId) throw createError({ statusCode: 400, statusMessage: '启用支付前请填写 App ID' })
  if (enabled && body.privateKey) {
    try {
      crypto.createPrivateKey(normalizePrivateKey(String(body.privateKey)))
    } catch {
      throw createError({ statusCode: 400, statusMessage: '应用私钥格式无效，请粘贴完整 PEM 私钥（包含 BEGIN/END 行）' })
    }
  }
  const config = saveAlipayConfig({
    enabled,
    appId,
    gateway: String(body.gateway || 'https://openapi.alipay.com/gateway.do').trim(),
    privateKey: body.privateKey,
    alipayPublicKey: body.alipayPublicKey,
    notifyUrl: String(body.notifyUrl || '').trim(),
    returnUrl: String(body.returnUrl || '').trim(),
    subjectPrefix: String(body.subjectPrefix || 'Xo Studio Order').trim()
  })
  return { success: true, config: publicAlipayConfig(config) }
})
