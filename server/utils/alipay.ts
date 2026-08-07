import fs from 'node:fs'
import crypto from 'node:crypto'
import { createError } from 'h3'
import { getRuntimeDataPath } from './storage'

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

const CONFIG_PATH = getRuntimeDataPath('alipay-config.enc.json')
const SECRET = process.env.XO_ALIPAY_CONFIG_SECRET || process.env.E2EE_SECRET || 'XO_STUDIO_ALIPAY_CONFIG_2026'
const keyMaterial = () => crypto.createHash('sha256').update(SECRET).digest()
export function normalizePrivateKey(value: string) {
  let key = String(value || '').trim().replace(/\\n/g, '\n').replace(/\r/g, '')
  if (!key) return ''
  if (!key.includes('BEGIN')) {
    const compact = key.replace(/\s+/g, '')
    key = `-----BEGIN PRIVATE KEY-----\n${compact.match(/.{1,64}/g)?.join('\n') || compact}\n-----END PRIVATE KEY-----`
  }
  return key
}

function encrypt(value: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial(), iv)
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return { version: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') }
}
function decrypt(payload: any) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial(), Buffer.from(payload.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]).toString('utf8')
}

export function defaultAlipayConfig(): AlipayConfig {
  return { enabled: false, appId: '', gateway: 'https://openapi.alipay.com/gateway.do', privateKey: '', alipayPublicKey: '', notifyUrl: '', returnUrl: '', subjectPrefix: 'Xo Studio Order', productCode: 'FAST_INSTANT_TRADE_PAY' }
}
export function readAlipayConfig(): AlipayConfig {
  const fallback = defaultAlipayConfig()
  if (!fs.existsSync(CONFIG_PATH)) return fallback
  try { return { ...fallback, ...JSON.parse(decrypt(JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')))) } } catch { return fallback }
}
export function saveAlipayConfig(input: Partial<AlipayConfig>) {
  const current = readAlipayConfig()
  const next = { ...current, ...input, privateKey: input.privateKey === undefined ? current.privateKey : normalizePrivateKey(String(input.privateKey || '')), alipayPublicKey: input.alipayPublicKey === undefined ? current.alipayPublicKey : String(input.alipayPublicKey || '').trim(), productCode: 'FAST_INSTANT_TRADE_PAY' }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(encrypt(JSON.stringify(next)), null, 2), 'utf8')
  return next
}
export function publicAlipayConfig(config = readAlipayConfig()) {
  return { enabled: config.enabled, appId: config.appId, gateway: config.gateway, notifyUrl: config.notifyUrl, returnUrl: config.returnUrl, subjectPrefix: config.subjectPrefix, productCode: config.productCode, hasPrivateKey: Boolean(config.privateKey), hasAlipayPublicKey: Boolean(config.alipayPublicKey) }
}

function stringifyAlipayJson(value: unknown) {
  return JSON.stringify(value).replace(/[^\u0000-\u007f]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
}

export function buildAlipayPagePay(config: AlipayConfig, order: { outTradeNo: string; subject: string; totalAmount: string; notifyUrl: string; returnUrl: string }) {
  const params: Record<string, string> = {
    app_id: config.appId, method: 'alipay.trade.page.pay', format: 'JSON', charset: 'utf-8', sign_type: 'RSA2',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '), version: '1.0',
    notify_url: order.notifyUrl, return_url: order.returnUrl,
    biz_content: stringifyAlipayJson({ out_trade_no: order.outTradeNo, product_code: config.productCode || 'FAST_INSTANT_TRADE_PAY', total_amount: order.totalAmount, subject: order.subject })
  }
  const signContent = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&')
  const privateKey = normalizePrivateKey(config.privateKey)
  try { crypto.createPrivateKey(privateKey) } catch { throw createError({ statusCode: 400, statusMessage: '应用私钥格式无效，请粘贴完整 PEM 私钥（含 BEGIN/END 行）' }) }
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signContent, 'utf8')
  return { params, sign: signer.sign(privateKey, 'base64') }
}
