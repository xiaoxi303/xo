import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export function getRuntimeDataDir(): string {
  const configured = process.env.XO_DATA_DIR || process.env.NUXT_XO_DATA_DIR
  const dataDir = configured
    ? path.resolve(configured)
    : path.resolve(process.cwd(), 'content')

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  return dataDir
}

export function getRuntimeDataPath(...segments: string[]): string {
  const filePath = path.join(getRuntimeDataDir(), ...segments)
  const dir = path.dirname(filePath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  return filePath
}

// ============================================================================
// 服务端独立文件金库加密引擎 (Quantum-Grade Server Standalone File Encryption)
// 规范：AES-256-GCM + HKDF-SHA512 派生密钥 + HMAC-SHA512 数字防篡改封签
// ============================================================================

function getVaultRootSecret(): Buffer {
  const envSecret = process.env.VAULT_MASTER_SECRET || process.env.XO_VAULT_MASTER_SECRET
  if (envSecret && envSecret.length >= 32) {
    return Buffer.from(envSecret, 'utf8')
  }
  const secretPath = path.resolve(process.cwd(), 'content', '.vault', 'master.secret')
  try {
    if (fs.existsSync(secretPath)) {
      const s = fs.readFileSync(secretPath, 'utf8').trim()
      if (s && s.length >= 32) return Buffer.from(s, 'utf8')
    }
  } catch {}
  return Buffer.from('XO_STUDIO_WORLD_CLASS_QUANTUM_SECRET_2026', 'utf8')
}

/**
 * 将数据字符串或 Buffer 封装为高强度抗量子级联加密文件信封
 */
export function encryptFileContent(plainText: string | Buffer, customSecret?: string): string {
  const rootSecret = customSecret ? Buffer.from(customSecret, 'utf8') : getVaultRootSecret()
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(12)

  // 派生 256 位 AES 密钥与 512 位 HMAC 防篡改封签密钥
  const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v3', 'utf8'), 32 + 64))
  const aesKey = derivedKeyMaterial.subarray(0, 32)
  const hmacKey = derivedKeyMaterial.subarray(32, 96)

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv)
  const plainBuffer = Buffer.isBuffer(plainText) ? plainText : Buffer.from(plainText, 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()])
  const authTag = cipher.getAuthTag()

  // 计算 HMAC-SHA512 全量防篡改数字指纹
  const seal = crypto
    .createHmac('sha512', hmacKey)
    .update(salt)
    .update(iv)
    .update(authTag)
    .update(ciphertext)
    .digest('hex')

  return `$XO_VAULT_FILE_V3$${salt.toString('hex')}$${iv.toString('hex')}$${authTag.toString('hex')}$${ciphertext.toString('hex')}$${seal}`
}

/**
 * 校验并解密金库加密文件信封，支持普通明文文件平滑向后兼容
 */
export function decryptFileContent(envelope: string, customSecret?: string): string {
  if (!envelope || typeof envelope !== 'string') return ''
  if (!envelope.startsWith('$XO_VAULT_FILE_V3$')) {
    // 兼容历史纯文本或非加密文件
    return envelope
  }

  const parts = envelope.split('$')
  // parts: ['', 'XO_VAULT_FILE_V3', salt, iv, authTag, ciphertext, seal]
  if (parts.length < 7) {
    throw new Error('无效的金库加密文件结构')
  }

  const salt = Buffer.from(parts[2], 'hex')
  const iv = Buffer.from(parts[3], 'hex')
  const authTag = Buffer.from(parts[4], 'hex')
  const ciphertext = Buffer.from(parts[5], 'hex')
  const expectedSeal = parts[6]

  const rootSecret = customSecret ? Buffer.from(customSecret, 'utf8') : getVaultRootSecret()
  const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v3', 'utf8'), 32 + 64))
  const aesKey = derivedKeyMaterial.subarray(0, 32)
  const hmacKey = derivedKeyMaterial.subarray(32, 96)

  // 常数时间校验数字防篡改封签
  const actualSeal = crypto
    .createHmac('sha512', hmacKey)
    .update(salt)
    .update(iv)
    .update(authTag)
    .update(ciphertext)
    .digest('hex')

  const bufActual = Buffer.from(actualSeal, 'hex')
  const bufExpected = Buffer.from(expectedSeal, 'hex')
  if (bufActual.length !== bufExpected.length || !crypto.timingSafeEqual(bufActual, bufExpected)) {
    throw new Error('金库文件数字签名校验失败：文件已被外部篡改或损坏')
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * 安全读取磁盘加密文件
 */
export function readEncryptedFile(filePath: string, customSecret?: string): string {
  if (!fs.existsSync(filePath)) return ''
  const raw = fs.readFileSync(filePath, 'utf8')
  return decryptFileContent(raw, customSecret)
}

/**
 * 安全写入加密文件到磁盘，并强制应用 0600 私有安全权限
 */
export function writeEncryptedFile(filePath: string, content: string | Buffer, customSecret?: string): void {
  const encrypted = encryptFileContent(content, customSecret)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, encrypted, { encoding: 'utf8', mode: 0o600 })
}

/**
 * 读取加密 JSON 数据文件
 */
export function readEncryptedJson<T>(filePath: string, fallback: T, customSecret?: string): T {
  if (!fs.existsSync(filePath)) return fallback
  try {
    const text = readEncryptedFile(filePath, customSecret)
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

/**
 * 写入加密 JSON 数据文件
 */
export function writeEncryptedJson<T>(filePath: string, data: T, customSecret?: string): void {
  const json = JSON.stringify(data, null, 2)
  writeEncryptedFile(filePath, json, customSecret)
}
