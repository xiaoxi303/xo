import fs from 'node:fs'
import crypto from 'node:crypto'
import { createError } from 'h3'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from './storage'

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
const SECRET = process.env.XO_ALIPAY_CONFIG_SECRET || process.env.VAULT_MASTER_SECRET || process.env.E2EE_SECRET || 'XO_STUDIO_ALIPAY_CONFIG_2026'
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
export function normalizePublicKey(value: string) {
  let key = String(value || '').trim().replace(/\\n/g, '\n').replace(/\r/g, '')
  if (!key) return ''
  if (!key.includes('BEGIN')) {
    const compact = key.replace(/\s+/g, '')
    key = `-----BEGIN PUBLIC KEY-----\n${compact.match(/.{1,64}/g)?.join('\n') || compact}\n-----END PUBLIC KEY-----`
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
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8').trim()
    if (raw.startsWith('$XO_VAULT_FILE_V3$')) {
      return { ...fallback, ...readEncryptedJson<AlipayConfig>(CONFIG_PATH, fallback) }
    }
    return { ...fallback, ...JSON.parse(decrypt(JSON.parse(raw))) }
  } catch {
    return fallback
  }
}
export function saveAlipayConfig(input: Partial<AlipayConfig>) {
  const current = readAlipayConfig()
  const next = { ...current, ...input, privateKey: input.privateKey === undefined ? current.privateKey : normalizePrivateKey(String(input.privateKey || '')), alipayPublicKey: input.alipayPublicKey === undefined ? current.alipayPublicKey : String(input.alipayPublicKey || '').trim(), productCode: 'FAST_INSTANT_TRADE_PAY' }
  writeEncryptedJson(CONFIG_PATH, next)
  return next
}
export function publicAlipayConfig(config = readAlipayConfig()) {
  return { enabled: config.enabled, appId: config.appId, gateway: config.gateway, notifyUrl: config.notifyUrl, returnUrl: config.returnUrl, subjectPrefix: config.subjectPrefix, productCode: config.productCode, alipayPublicKey: config.alipayPublicKey, hasPrivateKey: Boolean(config.privateKey), hasAlipayPublicKey: Boolean(config.alipayPublicKey) }
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

/**
 * 校验支付宝官方 RSA2 异步通知签名 (金库安全共识通道)
 */
export function verifyAlipayNotify(body: Record<string, any>, publicKey: string): boolean {
  if (!body || typeof body !== 'object' || !publicKey) return false
  const sign = String(body.sign || '')
  if (!sign || String(body.sign_type || '') !== 'RSA2') return false
  const content = Object.keys(body)
    .filter(key => key !== 'sign' && key !== 'sign_type' && body[key] !== '' && body[key] !== undefined && body[key] !== null)
    .sort()
    .map(key => `${key}=${body[key]}`)
    .join('&')
  try {
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(content, 'utf8')
    return verifier.verify(publicKey, sign, 'base64')
  } catch {
    return false
  }
}

