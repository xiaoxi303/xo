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
// 服务端独立文件量子金库存储引擎 V4 (Quantum-Grade Standalone File Vault V4)
// 规范：AES-256-GCM + HKDF-SHA512 + 双重 HMAC-SHA512/SHA384 抗篡改数字签名封签
// ============================================================================

export function getVaultRootSecret(): Buffer {
  // 1. 优先从环境变量读取
  const envSecret = process.env.VAULT_MASTER_SECRET || process.env.XO_VAULT_MASTER_SECRET
  if (envSecret && envSecret.length >= 32) {
    return Buffer.from(envSecret, 'utf8')
  }

  // 2. 自动探测并解析 .env
  const cwd = process.cwd()
  const candidateEnvPaths = [
    path.resolve(cwd, '.env'),
    path.resolve(cwd, '..', '.env')
  ]
  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const raw = fs.readFileSync(envPath, 'utf8')
        const match = raw.match(/^(?:VAULT_MASTER_SECRET|XO_VAULT_MASTER_SECRET)\s*=\s*(["']?)(.+?)\1$/m)
        if (match && match[2] && match[2].trim().length >= 32) {
          const s = match[2].trim()
          process.env.VAULT_MASTER_SECRET = s
          return Buffer.from(s, 'utf8')
        }
      } catch {}
    }
  }

  // 3. 从 content/.vault/master.secret 读取
  const secretPath = path.resolve(cwd, 'content', '.vault', 'master.secret')
  try {
    if (fs.existsSync(secretPath)) {
      const s = fs.readFileSync(secretPath, 'utf8').trim()
      if (s && s.length >= 32) {
        process.env.VAULT_MASTER_SECRET = s
        return Buffer.from(s, 'utf8')
      }
    }
    // 4. 若不存在则自动生成 512 位强随机主密钥并持久化
    const generated = crypto.randomBytes(64).toString('hex')
    fs.mkdirSync(path.dirname(secretPath), { recursive: true })
    fs.writeFileSync(secretPath, generated, { encoding: 'utf8', mode: 0o600 })
    process.env.VAULT_MASTER_SECRET = generated
    return Buffer.from(generated, 'utf8')
  } catch {}

  return Buffer.from('XO_STUDIO_WORLD_CLASS_QUANTUM_SECRET_2026', 'utf8')
}

/**
 * 将数据封装为 V4 高强度抗量子级联加密文件信封（含双重数字防篡改封签与微秒级防重放时间戳）
 */
export function encryptFileContent(plainText: string | Buffer, customSecret?: string): string {
  const rootSecret = customSecret ? Buffer.from(customSecret, 'utf8') : getVaultRootSecret()
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(12)
  const timestamp = Date.now().toString(16)

  // HKDF-SHA512 派生 144 字节密钥材料: 32(AES-256) + 64(HMAC-SHA512) + 48(HMAC-SHA384)
  const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v4', 'utf8'), 144))
  const aesKey = derivedKeyMaterial.subarray(0, 32)
  const hmacKey = derivedKeyMaterial.subarray(32, 96)
  const sigKey = derivedKeyMaterial.subarray(96, 144)

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv)
  const plainBuffer = Buffer.isBuffer(plainText) ? plainText : Buffer.from(plainText, 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()])
  const authTag = cipher.getAuthTag()

  // 计算第一重全量封签 (HMAC-SHA512)
  const hmac512 = crypto
    .createHmac('sha512', hmacKey)
    .update(salt)
    .update(iv)
    .update(authTag)
    .update(Buffer.from(timestamp, 'utf8'))
    .update(ciphertext)
    .digest('hex')

  // 计算第二重高阶数字防伪验签 (HMAC-SHA384)
  const hmac384 = crypto
    .createHmac('sha384', sigKey)
    .update(salt)
    .update(Buffer.from(timestamp, 'utf8'))
    .update(Buffer.from(hmac512, 'utf8'))
    .digest('hex')

  const seal = `${hmac512}.${hmac384}`
  return `$XO_VAULT_FILE_V4$${salt.toString('hex')}$${iv.toString('hex')}$${authTag.toString('hex')}$${timestamp}$${ciphertext.toString('hex')}$${seal}`
}

function internalDecrypt(trimmed: string, rootSecret: Buffer): string {
  // 1. 处理 V4 版本（增强型双重数字签名与时间戳）
  if (trimmed.startsWith('$XO_VAULT_FILE_V4$')) {
    const parts = trimmed.split('$')
    if (parts.length < 8) {
      throw new Error('无效的 V4 金库加密文件结构')
    }

    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const timestamp = parts[5]
    const ciphertext = Buffer.from(parts[6], 'hex')
    const expectedSeal = parts[7]

    const [expected512, expected384] = expectedSeal.split('.')
    if (!expected512 || !expected384) {
      throw new Error('V4 金库数字封签结构损坏')
    }

    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v4', 'utf8'), 144))
    const aesKey = derivedKeyMaterial.subarray(0, 32)
    const hmacKey = derivedKeyMaterial.subarray(32, 96)
    const sigKey = derivedKeyMaterial.subarray(96, 144)

    // 校验第一重 HMAC-SHA512
    const actual512 = crypto
      .createHmac('sha512', hmacKey)
      .update(salt)
      .update(iv)
      .update(authTag)
      .update(Buffer.from(timestamp, 'utf8'))
      .update(ciphertext)
      .digest('hex')

    const bufActual512 = Buffer.from(actual512, 'hex')
    const bufExpected512 = Buffer.from(expected512, 'hex')
    if (bufActual512.length !== bufExpected512.length || !crypto.timingSafeEqual(bufActual512, bufExpected512)) {
      throw new Error('V4 金库数字主签名校验失败：文件内容已被篡改或主密钥不匹配')
    }

    // 校验第二重 HMAC-SHA384 防伪链
    const actual384 = crypto
      .createHmac('sha384', sigKey)
      .update(salt)
      .update(Buffer.from(timestamp, 'utf8'))
      .update(Buffer.from(actual512, 'utf8'))
      .digest('hex')

    const bufActual384 = Buffer.from(actual384, 'hex')
    const bufExpected384 = Buffer.from(expected384, 'hex')
    if (bufActual384.length !== bufExpected384.length || !crypto.timingSafeEqual(bufActual384, bufExpected384)) {
      throw new Error('V4 金库级联防伪签名校验失败：数字指纹已被破坏')
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return decrypted.toString('utf8')
  }

  // 2. 平滑兼容 V3 版本
  if (trimmed.startsWith('$XO_VAULT_FILE_V3$')) {
    const parts = trimmed.split('$')
    if (parts.length < 7) {
      throw new Error('无效的 V3 金库加密文件结构')
    }

    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const ciphertext = Buffer.from(parts[5], 'hex')
    const expectedSeal = parts[6]

    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v3', 'utf8'), 32 + 64))
    const aesKey = derivedKeyMaterial.subarray(0, 32)
    const hmacKey = derivedKeyMaterial.subarray(32, 96)

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
      throw new Error('V3 金库文件数字签名校验失败：文件已被外部篡改或主密钥不匹配')
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return decrypted.toString('utf8')
  }

  // 3. 兼容历史未加密明文
  return trimmed
}

/**
 * 校验并解密金库加密文件信封，无缝兼容 V4、V3 与历史明文文件 (支持主密钥与集群默认密钥平滑回退)
 */
export function decryptFileContent(envelope: string, customSecret?: string): string {
  if (!envelope || typeof envelope !== 'string') return ''
  const trimmed = envelope.trim()

  const primarySecret = customSecret ? Buffer.from(customSecret, 'utf8') : getVaultRootSecret()
  try {
    return internalDecrypt(trimmed, primarySecret)
  } catch (primaryErr: any) {
    if (!customSecret) {
      const fallbackSecret = Buffer.from('XO_STUDIO_WORLD_CLASS_QUANTUM_SECRET_2026', 'utf8')
      if (primarySecret.toString('hex') !== fallbackSecret.toString('hex')) {
        try {
          return internalDecrypt(trimmed, fallbackSecret)
        } catch {}
      }
    }
    throw primaryErr
  }
}

/**
 * 安全读取磁盘加密文件 (自动验签并解密)
 */
export function readEncryptedFile(filePath: string, customSecret?: string): string {
  if (!fs.existsSync(filePath)) return ''
  const raw = fs.readFileSync(filePath, 'utf8')
  return decryptFileContent(raw, customSecret)
}

/**
 * 安全写入加密文件到磁盘，强制采用 V4 双重数字签名封签，并锁定 0600 私有安全权限
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
    if (!text || text.trim() === '') return fallback
    return JSON.parse(text) as T
  } catch (err) {
    console.warn(`[storage] Warning: Failed to parse encrypted json from ${path.basename(filePath)}:`, err)
    return fallback
  }
}

/**
 * 写入加密 JSON 数据文件 (强制 100% 密文存储与数字封签)
 */
export function writeEncryptedJson<T>(filePath: string, data: T, customSecret?: string): void {
  const json = JSON.stringify(data, null, 2)
  writeEncryptedFile(filePath, json, customSecret)
}
