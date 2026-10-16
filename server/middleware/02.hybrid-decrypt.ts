import { defineEventHandler, readBody, getRequestHeader, getRequestURL, createError, getCookie } from 'h3'
import { decryptRsaHybrid, isRsaHybridPayload, triggerIntruderLockout } from '../utils/vault-cipher'
import { readAlipayConfig, normalizePublicKey, verifyAlipayNotify } from '../utils/alipay'
import { validateSession, SESSION_COOKIE } from '../utils/auth'
import { getRealClientIP, isLocalOrPrivateIP } from '../utils/ip-helper'

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default defineEventHandler(async (event) => {
  const method = (event.method || 'GET').toUpperCase()
  if (!MUTATION_METHODS.has(method)) {
    return
  }

  const url = getRequestURL(event)
  const pathname = url.pathname.toLowerCase()

  // 全链路强约束：仅拦截 /api/ 范围内的全部变更接口，严禁任何降级与普通绕过
  if (!pathname.startsWith('/api/')) {
    return
  }

  // 读取请求载荷
  let body: any = null
  try {
    body = await readBody(event)
  } catch {
    // 空或损坏的载荷会在后续强校验中被拦截
  }

  // 1. 【核心通道 A】：全站双舱多态混合加密强共识载荷
  // 所有普通业务接口、认证鉴权、人机核验校验、加密数据必须优先通过此舱解密（无论请求者是否携带管理员会话）
  if (isRsaHybridPayload(body)) {
    try {
      const decryptedString = await decryptRsaHybrid(body, event)
      const decryptedObj = JSON.parse(decryptedString)

      // 覆盖挂载至 h3 解析存储中，供下游所有业务端点直接透明读取解密后的数据对象
      event.node.req[Symbol.for('h3ParsedBody')] = decryptedObj
      ;(event as any)._body = decryptedObj
      ;(event.node.req as any)._body = decryptedObj
      event.context.hybridDecrypted = true
      event.context.decryptedBody = decryptedObj
      event.context.rawHybridPayload = body
      return
    } catch (decryptErr: any) {
      console.error('[02.hybrid-decrypt] Decrypt error:', decryptErr?.message || decryptErr)
      throw createError({
        statusCode: 400,
        statusMessage: '安全策略拦截：公钥凭据已失效或时钟不同步，请刷新页面后重试。'
      })
    }
  }

  // 2. 0字节信号端点（如登出通知、视图浏览计数等无载荷信号）
  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (
    (pathname === '/api/auth/logout' || pathname === '/api/auth/client-logout' || pathname.endsWith('/view')) &&
    contentLength === 0
  ) {
    return
  }

  // 3. 【无载荷管理指令放行】：若无请求载荷（0 字节）且持有合法管理员会话凭据（如仅附带 Query 参数的 DELETE 指令），允许直接通行
  if (contentLength === 0 && (!body || (typeof body === 'object' && Object.keys(body).length === 0))) {
    const adminCookie = getCookie(event, SESSION_COOKIE)
    if (adminCookie && validateSession(adminCookie)) {
      return
    }
  }

  // 4. 【文件上传通道】：多部分表单 (multipart/form-data) 上传直通专用处理（由上层接口自身进行权限与 MIME 审查）
  const contentType = (getRequestHeader(event, 'content-type') || '').toLowerCase()
  if (contentType.includes('multipart/form-data')) {
    return
  }

  // 5. 【前端遥测与公开原子信号放行】：统计打点、咖啡互动计数、人机安全核验门放行
  if (
    pathname === '/api/analytics/event' ||
    pathname === '/api/stats/coffee-increment' ||
    pathname.startsWith('/api/security/')
  ) {
    return
  }

  // 6. 【核心通道 B】：专属支付网关金库共识验签通道 (针对支付宝异步回调)
  // 严格杜绝作为无保护豁免，必须在此处完成官方公钥 RSA2 签名核验，伪造请求秒级拉黑
  if (pathname === '/api/order/notify' || /^\/api\/order\/.*notify/i.test(pathname)) {
    const alipayConfig = readAlipayConfig()
    const alipayPubKey = normalizePublicKey(alipayConfig.alipayPublicKey)

    if (body && typeof body === 'object' && alipayPubKey && verifyAlipayNotify(body, alipayPubKey)) {
      event.context.paymentVaultVerified = true
      return
    }

    // 签名伪造或非官方支付回调探测：仅对非本地外部请求触发主动反制封禁
    const clientIp = getRealClientIP(event)
    if (!isLocalOrPrivateIP(clientIp) && process.env.NODE_ENV === 'production') {
      await triggerIntruderLockout(event, '伪造支付回调通知或RSA2验签未通过')
    }
    throw createError({
      statusCode: 400,
      statusMessage: '安全策略拦截：支付网关共识验签未通过，已记录恶意探测行为。'
    })
  }

  // 7. 【严厉拦截 / 零降级全站强加密底座】：任何试图以明文、未经双舱量子装甲加密的请求或伪造格式探测 API 的行为，一律拒绝
  const clientIp = getRealClientIP(event)
  if (!isLocalOrPrivateIP(clientIp) && process.env.NODE_ENV === 'production') {
    await triggerIntruderLockout(event, `未通过量子金库加密传输/尝试明文探测或降级: ${pathname}`)
  }

  throw createError({
    statusCode: 400,
    statusMessage: '全站强安全策略拦截：全链路强制要求安全加密传输，严禁任何明文访问或降级行为。'
  })
})
