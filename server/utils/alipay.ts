/**
 * alipay.ts · 兼容过渡桥接层
 * 现已全面升级并统一收敛至自研加密 Stripe 架构 (server/utils/stripe.ts)
 */
import {
  readStripeConfig,
  saveStripeConfig,
  publicStripeConfig,
  defaultStripeConfig,
  type StripeConfig
} from './stripe'

export interface AlipayConfig {
  enabled: boolean
  appId: string
  gateway: string
  privateKey: string
  alipayPublicKey: string
  notifyUrl: string
  returnUrl: string
  subjectPrefix: string
  productCode: string
}

export function defaultAlipayConfig(): AlipayConfig {
  const stripe = defaultStripeConfig()
  return {
    enabled: stripe.enabled,
    appId: stripe.publishableKey,
    gateway: 'https://api.stripe.com/v1/checkout/sessions',
    privateKey: stripe.secretKey,
    alipayPublicKey: stripe.webhookSecret,
    notifyUrl: stripe.successUrl,
    returnUrl: stripe.cancelUrl,
    subjectPrefix: stripe.subjectPrefix,
    productCode: 'STRIPE_CHECKOUT'
  }
}

export function normalizePrivateKey(value: string) {
  return String(value || '').trim()
}

export function normalizePublicKey(value: string) {
  return String(value || '').trim()
}

export function readAlipayConfig(): AlipayConfig {
  const stripe = readStripeConfig()
  return {
    enabled: stripe.enabled,
    appId: stripe.publishableKey,
    gateway: 'https://api.stripe.com/v1/checkout/sessions',
    privateKey: stripe.secretKey,
    alipayPublicKey: stripe.webhookSecret,
    notifyUrl: stripe.successUrl,
    returnUrl: stripe.cancelUrl,
    subjectPrefix: stripe.subjectPrefix,
    productCode: 'STRIPE_CHECKOUT'
  }
}

export function saveAlipayConfig(input: Partial<AlipayConfig>) {
  const patch: Partial<StripeConfig> = {}
  if (input.enabled !== undefined) patch.enabled = input.enabled
  if (input.appId !== undefined) patch.publishableKey = input.appId
  if (input.privateKey !== undefined) patch.secretKey = input.privateKey
  if (input.alipayPublicKey !== undefined) patch.webhookSecret = input.alipayPublicKey
  if (input.subjectPrefix !== undefined) patch.subjectPrefix = input.subjectPrefix
  saveStripeConfig(patch)
  return readAlipayConfig()
}

export function publicAlipayConfig(config = readAlipayConfig()) {
  const stripe = publicStripeConfig()
  return {
    enabled: stripe.enabled,
    appId: stripe.publishableKey,
    gateway: 'https://api.stripe.com/v1/checkout/sessions',
    notifyUrl: stripe.successUrl,
    returnUrl: stripe.cancelUrl,
    subjectPrefix: stripe.subjectPrefix,
    productCode: 'STRIPE_CHECKOUT',
    alipayPublicKey: stripe.hasWebhookSecret ? '🔒 已配置 Stripe Webhook 密钥' : '',
    hasPrivateKey: stripe.hasSecretKey,
    hasAlipayPublicKey: stripe.hasWebhookSecret
  }
}

export function buildAlipayPagePay(config: AlipayConfig, order: { outTradeNo: string; subject: string; totalAmount: string; notifyUrl: string; returnUrl: string }) {
  return {
    gateway: 'https://api.stripe.com/v1/checkout/sessions',
    params: { outTradeNo: order.outTradeNo, amount: order.totalAmount },
    sign: 'STRIPE_QUANTUM_V5'
  }
}

export function verifyAlipayNotify(body: Record<string, any>, publicKey: string): boolean {
  return false
}
