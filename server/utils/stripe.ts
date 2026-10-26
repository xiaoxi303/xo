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
  const envSecret = (process.env.STRIPE_SECRET_KEY || '').trim()
  const envPub = (process.env.STRIPE_PUBLISHABLE_KEY || '').trim()
  const envWebhook = (process.env.STRIPE_WEBHOOK_SECRET || '').trim()
  const envCurrency = (process.env.STRIPE_CURRENCY || 'cny').trim().toLowerCase()
  return {
    enabled: Boolean(envSecret),
    publishableKey: envPub,
    secretKey: envSecret,
    webhookSecret: envWebhook,
    currency: envCurrency || 'cny',
    mode: 'payment',
    successUrl: '',
    cancelUrl: '',
    subjectPrefix: 'XO Studio 订单'
  }
}

export function readStripeConfig(): StripeConfig {
  const fallback = defaultStripeConfig()
  if (!fs.existsSync(CONFIG_PATH)) {
    const legacyPath = getRuntimeDataPath('alipay-config.enc.json')
    if (fs.existsSync(legacyPath)) {
      try {
        const legacy = readEncryptedJson<any>(legacyPath, {})
        if (legacy && typeof legacy === 'object') {
          const initial = {
            ...fallback,
            enabled: Boolean(legacy.enabled || fallback.enabled),
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
    const merged: StripeConfig = {
      ...fallback,
      ...loaded,
      publishableKey: (loaded.publishableKey || fallback.publishableKey || '').trim(),
      secretKey: (loaded.secretKey || fallback.secretKey || '').trim(),
      webhookSecret: (loaded.webhookSecret || fallback.webhookSecret || '').trim(),
      currency: (loaded.currency || fallback.currency || 'cny').trim().toLowerCase()
    }
    if (merged.secretKey && loaded.enabled === undefined) {
      merged.enabled = true
    }
    return merged
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

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
])

/**
 * 计算符合 Stripe 全球最低结算门槛 ($0.50 USD 等值) 的最小交易单位金额
 * 解决 ¥1.00 CNY (约 $0.14 USD) 触发 Stripe `amount_too_small` 报错的问题
 */
function computeStripeUnitAmount(totalAmountMajor: number, currency: string, enforceMinimum = true): number {
  const curr = currency.toLowerCase()
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(curr)
  const rawUnit = isZeroDecimal
    ? Math.max(1, Math.round(Number(totalAmountMajor)))
    : Math.max(1, Math.round(Number(totalAmountMajor) * 100))

  if (!enforceMinimum) return rawUnit

  const minMap: Record<string, number> = {
    cny: 400, // ¥4.00 RMB (>= $0.50 USD)
    hkd: 400, // HK$4.00
    usd: 50,  // $0.50
    eur: 50,  // €0.50
    gbp: 50,  // £0.50
    sgd: 50,  // S$0.50
    aud: 50,  // A$0.50
    cad: 50,  // C$0.50
    jpy: 50   // ¥50 JPY
  }
  const minRequired = minMap[curr] || (isZeroDecimal ? 50 : 50)
  return Math.max(rawUnit, minRequired)
}

function translateStripeError(errObj: any): string {
  const code = String(errObj?.code || '')
  const param = String(errObj?.param || '')
  const rawMsg = String(errObj?.message || '')

  if (code === 'amount_too_small' || rawMsg.toLowerCase().includes('must convert to at least') || rawMsg.toLowerCase().includes('must be at least')) {
    return `订单金额低于 Stripe 国际清算最低门槛（需至少折合 $0.50 美金，约 ¥4.00 人民币）。原始信息：${rawMsg}`
  }
  if (code === 'api_key_expired' || code === 'invalid_api_key' || rawMsg.toLowerCase().includes('invalid api key')) {
    return `Stripe Secret Key (私钥) 无效或已过期，请在后台检查 sk_live_ / sk_test_ 密钥配置。`
  }
  if (rawMsg.toLowerCase().includes('cannot currently make live charges') || rawMsg.toLowerCase().includes('account is not enabled')) {
    return `您的 Stripe 账户尚未完成正式环境 (Live) 商户激活审核，暂时无法发起真实收款（可先切换使用 sk_test_ 测试密钥，或在 Stripe 后台完成账户激活）。原始信息：${rawMsg}`
  }
  if (param === 'payment_method_types' || rawMsg.toLowerCase().includes('payment_method_types')) {
    return `Stripe 支付方式或币种不匹配：请确认您的 Stripe 后台「设置 -> 支付方式 (Payment methods)」已开启银行卡 (Cards) 或支付宝，且支持所选币种。原始信息：${rawMsg}`
  }
  return `Stripe 接口返回错误：${rawMsg || '创建支付会话失败'}`
}

/**
 * 原生创建 Stripe Checkout 支付会话 (自带智能多策略自愈容错：动态支付方式 -> 显式 Card -> 跨币种 USD 降级 + 最低金额门槛保护)
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
    throw createError({
      statusCode: 400,
      statusMessage: 'STRIPE_SECRET_MISSING',
      message: 'Stripe Secret Key 尚未配置，请先在后台填写并保存密钥。',
      data: { statusMessage: 'Stripe Secret Key 尚未配置，请先在后台填写并保存密钥。' }
    })
  }

  // 若用户误将 Publishable Key (pk_) 填入了 Secret Key 栏位
  if (secretKey.startsWith('pk_')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'STRIPE_INVALID_SECRET_TYPE',
      message: '后台 Secret Key (私钥) 栏位误填入了公钥 (pk_ 开头)，请改为填入以 sk_live_ 或 sk_test_ 开头的私钥！',
      data: { statusMessage: '后台 Secret Key (私钥) 栏位误填入了公钥 (pk_ 开头)，请改为填入以 sk_live_ 或 sk_test_ 开头的私钥！' }
    })
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

  const primaryCurrency = (order.currency || config.currency || 'cny').toLowerCase()
  const amountNum = Number(order.totalAmount) || 4

  // 构建多策略自愈候选队列 (适配 Stripe 2026-09-30.endive 最新版动态支付方式规范及最低金额门槛)
  interface AttemptProfile {
    label: string
    currency: string
    unitAmount: number
    paymentMethodTypes?: string[]
  }

  const primaryUnitSafe = computeStripeUnitAmount(amountNum, primaryCurrency, true)
  const usdConvertedAmount = primaryCurrency === 'cny' ? Math.max(0.5, Number((amountNum / 7.2).toFixed(2))) : Math.max(0.5, amountNum)
  const usdUnitSafe = computeStripeUnitAmount(usdConvertedAmount, 'usd', true)

  const attempts: AttemptProfile[] = [
    // 策略 1: Stripe 2025/2026 官方推荐 — 不传 payment_method_types，自动启用商户后台配置的全部动态支付方式 (Card / Alipay / WeChat Pay / Link 等)
    {
      label: 'dynamic-primary',
      currency: primaryCurrency,
      unitAmount: primaryUnitSafe
    },
    // 策略 2: 显式指定 card 支付方式 + 主币种
    {
      label: 'explicit-card-primary',
      currency: primaryCurrency,
      unitAmount: primaryUnitSafe,
      paymentMethodTypes: ['card']
    },
    // 策略 3: 若主币种不是 USD，自动尝试 USD + 动态支付方式 (解决部分境外 Stripe 账号仅开通 USD 结算或支付方式不支持 CNY 的问题)
    ...(primaryCurrency !== 'usd'
      ? [
          {
            label: 'dynamic-usd-fallback',
            currency: 'usd',
            unitAmount: usdUnitSafe
          },
          {
            label: 'explicit-card-usd-fallback',
            currency: 'usd',
            unitAmount: usdUnitSafe,
            paymentMethodTypes: ['card']
          }
        ]
      : [])
  ]

  let lastError: any = null

  for (const attempt of attempts) {
    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('client_reference_id', order.outTradeNo)
    params.append('success_url', order.successUrl)
    params.append('cancel_url', order.cancelUrl)

    if (attempt.paymentMethodTypes && attempt.paymentMethodTypes.length > 0) {
      attempt.paymentMethodTypes.forEach((pm, idx) => {
        params.append(`payment_method_types[${idx}]`, pm)
      })
    }

    params.append('line_items[0][price_data][currency]', attempt.currency)
    params.append('line_items[0][price_data][unit_amount]', String(attempt.unitAmount))
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

      const data = (await response.json()) as any
      if (response.ok && data?.url) {
        return {
          id: data.id,
          url: data.url,
          clientSecret: data.client_secret,
          outTradeNo: order.outTradeNo
        }
      }

      lastError = data?.error || { message: response.statusText || '创建会话失败' }
      console.warn(`[stripe] Attempt [${attempt.label}] failed:`, lastError?.code, lastError?.param, lastError?.message)

      // 如果是密钥本身错误或账户未激活，无需继续重试其它策略，直接跳出
      const errCode = String(lastError?.code || '')
      const errMsg = String(lastError?.message || '').toLowerCase()
      if (
        errCode === 'invalid_api_key' ||
        errCode === 'api_key_expired' ||
        errMsg.includes('invalid api key') ||
        errMsg.includes('cannot currently make live charges')
      ) {
        break
      }
    } catch (networkErr: any) {
      lastError = { message: networkErr?.message || '网络连接超时' }
      console.error(`[stripe] Network error on attempt [${attempt.label}]:`, networkErr)
      break
    }
  }

  const friendlyMsg = translateStripeError(lastError)
  throw createError({
    statusCode: 400,
    statusMessage: 'STRIPE_API_REJECTED',
    message: friendlyMsg,
    data: {
      statusMessage: friendlyMsg,
      stripeError: lastError
    }
  })
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
