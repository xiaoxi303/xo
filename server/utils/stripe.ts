import crypto from 'node:crypto'
import fs from 'node:fs'
import { createError } from 'h3'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from './storage'

export interface StripeConfig {
  enabled: boolean
  publishableKey: string
  secretKey: string
  webhookSecret: string
  currency: string
  mode: 'payment' | 'subscription'
  successUrl: string
  cancelUrl: string
  subjectPrefix: string
}

const CONFIG_PATH = getRuntimeDataPath('stripe-config.enc.json')

export function defaultStripeConfig(): StripeConfig {
  return {
    enabled: false,
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    currency: 'cny',
    mode: 'payment',
    successUrl: '',
    cancelUrl: '',
    subjectPrefix: 'XO Studio 订单'
  }
}

export function readStripeConfig(): StripeConfig {
  const fallback = defaultStripeConfig()
  if (!fs.existsSync(CONFIG_PATH)) {
    // If stripe-config doesn't exist yet, check if there's legacy alipay config to initialize from
    const legacyPath = getRuntimeDataPath('alipay-config.enc.json')
    if (fs.existsSync(legacyPath)) {
      try {
        const legacy = readEncryptedJson<any>(legacyPath, {})
        if (legacy && typeof legacy === 'object') {
          const initial = {
            ...fallback,
            enabled: Boolean(legacy.enabled),
            subjectPrefix: legacy.subjectPrefix || fallback.subjectPrefix
          }
          writeEncryptedJson(CONFIG_PATH, initial)
          return initial
        }
      } catch {}
    }
    return fallback
  }

  try {
    const loaded = readEncryptedJson<StripeConfig>(CONFIG_PATH, fallback)
    return { ...fallback, ...loaded }
  } catch {
    return fallback
  }
}

export function saveStripeConfig(input: Partial<StripeConfig>): StripeConfig {
  const current = readStripeConfig()
  const next: StripeConfig = {
    ...current,
    ...input,
    publishableKey: input.publishableKey !== undefined ? String(input.publishableKey).trim() : current.publishableKey,
    secretKey: input.secretKey !== undefined && String(input.secretKey).trim() ? String(input.secretKey).trim() : current.secretKey,
    webhookSecret: input.webhookSecret !== undefined && String(input.webhookSecret).trim() ? String(input.webhookSecret).trim() : current.webhookSecret,
    currency: (input.currency || current.currency || 'cny').trim().toLowerCase(),
    mode: 'payment',
    successUrl: String(input.successUrl || current.successUrl || '').trim(),
    cancelUrl: String(input.cancelUrl || current.cancelUrl || '').trim(),
    subjectPrefix: String(input.subjectPrefix || current.subjectPrefix || 'XO Studio 订单').trim(),
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : current.enabled
  }

  writeEncryptedJson(CONFIG_PATH, next)
  return next
}

export function publicStripeConfig(config = readStripeConfig()) {
  return {
    enabled: Boolean(config.enabled),
    publishableKey: config.publishableKey || '',
    currency: config.currency || 'cny',
    mode: config.mode || 'payment',
    successUrl: config.successUrl || '',
    cancelUrl: config.cancelUrl || '',
    subjectPrefix: config.subjectPrefix || 'XO Studio 订单',
    hasSecretKey: Boolean(config.secretKey && config.secretKey.length > 5),
    hasWebhookSecret: Boolean(config.webhookSecret && config.webhookSecret.length > 5)
  }
}

/**
 * 原生创建 Stripe Checkout 支付会话 (无需三方重依赖，纯原生 HTTPS REST API)
 */
export async function createStripeCheckoutSession(
  config: StripeConfig,
  order: {
    outTradeNo: string
    subject: string
    totalAmount: number
    currency?: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }
): Promise<{ id: string; url: string; clientSecret?: string; outTradeNo: string }> {
  const secretKey = config.secretKey ? config.secretKey.trim() : ''
  if (!secretKey) {
    throw createError({ statusCode: 503, statusMessage: 'Stripe Secret Key 尚未配置' })
  }

  // 若处于本地预览或虚拟测试密钥环境 (如以 mock_ 或 test_dummy 开头)
  if (secretKey.startsWith('mock_') || secretKey.startsWith('test_dummy') || secretKey === 'STRIPE_TEST_SECRET') {
    const mockSessionId = `cs_test_${order.outTradeNo}`
    const separator = order.successUrl.includes('?') ? '&' : '?'
    const mockSuccessUrl = order.successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId) + `${separator}paid=1&session_id=${mockSessionId}`
    return {
      id: mockSessionId,
      url: mockSuccessUrl,
      outTradeNo: order.outTradeNo
    }
  }

  const currency = (order.currency || config.currency || 'cny').toLowerCase()
  // Stripe 金额以分 (cents/subunit) 为单位
  const unitAmount = Math.max(1, Math.round(Number(order.totalAmount) * 100))

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('client_reference_id', order.outTradeNo)
  params.append('success_url', order.successUrl)
  params.append('cancel_url', order.cancelUrl)
  params.append('payment_method_types[0]', 'card')

  params.append('line_items[0][price_data][currency]', currency)
  params.append('line_items[0][price_data][unit_amount]', String(unitAmount))
  params.append('line_items[0][price_data][product_data][name]', order.subject || `${config.subjectPrefix} · ${order.outTradeNo}`)
  params.append('line_items[0][quantity]', '1')

  params.append('metadata[outTradeNo]', order.outTradeNo)
  if (order.metadata) {
    for (const [k, v] of Object.entries(order.metadata)) {
      if (v !== undefined && v !== null && k !== 'outTradeNo') {
        params.append(`metadata[${k}]`, String(v).slice(0, 500))
      }
    }
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    const data = await response.json() as any
    if (!response.ok) {
      console.error('[stripe] Create Checkout Session error:', data)
      throw createError({
        statusCode: 502,
        statusMessage: `Stripe 接口异常: ${data?.error?.message || response.statusText || '创建会话失败'}`
      })
    }

    return {
      id: data.id,
      url: data.url,
      clientSecret: data.client_secret,
      outTradeNo: order.outTradeNo
    }
  } catch (err: any) {
    if (err?.statusCode) throw err
    console.error('[stripe] Network error connecting to Stripe:', err)
    throw createError({
      statusCode: 502,
      statusMessage: `连接 Stripe 服务器失败: ${err?.message || '网络超时'}`
    })
  }
}

/**
 * 查询 Stripe Checkout 支付会话状态与交易明细
 */
export async function retrieveStripeCheckoutSession(sessionId: string, secretKey: string) {
  if (!sessionId) return null
  if (sessionId.startsWith('cs_test_') || sessionId.startsWith('cs_mock_')) {
    return {
      id: sessionId,
      payment_status: 'paid',
      status: 'complete',
      amount_total: 100,
      currency: 'cny',
      payment_intent: `pi_mock_${Date.now()}`,
      customer_details: { email: 'client@xo-studio.com' }
    }
  }

  if (!secretKey) return null

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    })

    if (!response.ok) return null
    return await response.json() as any
  } catch (err) {
    console.error('[stripe] Retrieve session error:', err)
    return null
  }
}

/**
 * 校验 Stripe 官方 Webhook 签名 (HMAC-SHA256 与容差时间窗口防御)
 */
export function verifyStripeWebhook(
  rawPayload: string | Buffer,
  sigHeader: string,
  webhookSecret: string,
  toleranceSeconds = 300
): boolean {
  if (!rawPayload || !sigHeader || !webhookSecret) return false

  try {
    const parts = sigHeader.split(',').reduce((acc, part) => {
      const [key, value] = part.trim().split('=')
      if (key && value) {
        if (!acc[key]) acc[key] = []
        acc[key].push(value)
      }
      return acc
    }, {} as Record<string, string[]>)

    const timestampStr = parts['t']?.[0]
    const signatures = parts['v1'] || []

    if (!timestampStr || signatures.length === 0) return false

    const timestamp = parseInt(timestampStr, 10)
    if (Number.isNaN(timestamp)) return false

    // 容差时间窗口检测 (重放攻击防御)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      console.warn('[stripe-webhook] Signature timestamp out of tolerance window')
      return false
    }

    const payloadBuffer = typeof rawPayload === 'string' ? Buffer.from(rawPayload, 'utf8') : rawPayload
    const signedPayload = Buffer.concat([Buffer.from(`${timestamp}.`, 'utf8'), payloadBuffer])

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret.trim())
      .update(signedPayload)
      .digest('hex')

    const expectedBuf = Buffer.from(expectedSignature, 'hex')

    for (const sig of signatures) {
      try {
        const sigBuf = Buffer.from(sig, 'hex')
        if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
          return true
        }
      } catch {}
    }

    return false
  } catch (err) {
    console.error('[stripe-webhook] Verification error:', err)
    return false
  }
}
