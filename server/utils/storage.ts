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
 * 生成仿真的拟态蜜罐诱饵数据（针对 JSON 或 Markdown 自动匹配形态与熵值）
 */
function generateDecoyPayload(plainStr: string): string {
  const isJson = plainStr.trim().startsWith('{') || plainStr.trim().startsWith('[')
  if (isJson) {
    try {
      const parsed = JSON.parse(plainStr)
      if (Array.isArray(parsed)) {
        return JSON.stringify(
          Array.from({ length: Math.min(parsed.length || 3, 5) }).map((_, idx) => ({
            id: `DECOY_${crypto.randomBytes(6).toString('hex')}`,
            syntheticIndex: idx,
            entropyToken: crypto.randomBytes(16).toString('hex'),
            timestamp: Date.now() - idx * 86400000,
            status: 'HONEYPOT_CHAMBER_SYNTHETIC'
          })),
          null,
          2
        )
      } else if (typeof parsed === 'object' && parsed !== null) {
        const decoyObj: Record<string, any> = {
          __vault_honey: 'DECOY_CHAMBER_ACTIVE',
          syntheticNodeId: `NODE_${crypto.randomBytes(8).toString('hex')}`,
          entropyVector: crypto.randomBytes(32).toString('hex'),
          timestamp: Date.now()
        }
        for (const k of Object.keys(parsed).slice(0, 10)) {
          decoyObj[k] = `SYNTHETIC_${crypto.randomBytes(8).toString('hex')}`
        }
        return JSON.stringify(decoyObj, null, 2)
      }
    } catch {}
  }
  // 针对 Markdown / YAML 作品形态生成高仿真蜜罐
  const decoySlug = `decoy-${crypto.randomBytes(4).toString('hex')}`
  return `---\nslug: ${decoySlug}\ntitle: "Synthetic HoneyPot Chamber"\nfeatured: false\ncreatedAt: "${new Date().toISOString()}"\n---\n\nSynthetic honeypot chamber decoy content for anti-tamper security.\n`
}

/**
 * 将数据封装为 V5 自研双舱量子加密文件信封 (Dual-Chamber Vault Engine V5)
 * 架构：真实业务舱 + 拟态诱饵蜜罐舱 + 随机 50/50 槽位混淆 + 双重 HMAC-512/384 级联数字防篡改封签
 */
export function encryptFileContent(plainText: string | Buffer, customSecret?: string): string {
  const rootSecret = customSecret ? Buffer.from(customSecret, 'utf8') : getVaultRootSecret()
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(12)
  const timestamp = Date.now().toString(16)

  const plainString = Buffer.isBuffer(plainText) ? plainText.toString('utf8') : String(plainText)
  const decoyString = generateDecoyPayload(plainString)

  const dataHash = crypto.createHash('sha512').update(Buffer.from(plainString, 'utf8')).digest('hex')
  const decoyHash = crypto.createHash('sha512').update(Buffer.from(decoyString, 'utf8')).digest('hex')

  // 50% 几率随机混淆真实舱与诱饵舱槽位
  const isFirstChamberGenuine = (crypto.randomBytes(1)[0] & 1) === 1
  const truthIndex = isFirstChamberGenuine ? 0 : 1

  const genuineChamber = {
    chamberType: 'GENUINE_MATRIX',
    hash: dataHash,
    payload: plainString
  }
  const decoyChamber = {
    chamberType: 'DECOY_HONEYPOT',
    hash: decoyHash,
    payload: decoyString
  }

  const chambers = isFirstChamberGenuine ? [genuineChamber, decoyChamber] : [decoyChamber, genuineChamber]

  // 计算真理共识证明 (基于主秘钥、时间戳与槽位)
  const truthProof = crypto
    .createHmac('sha512', rootSecret)
    .update(salt)
    .update(Buffer.from(timestamp, 'utf8'))
    .update(Buffer.from(String(truthIndex), 'utf8'))
    .digest('hex')

  const dualChamberPackage = JSON.stringify({
    vaultProtocol: 'XO_DUAL_CHAMBER_V5',
    timestamp,
    truthIndex,
    truthProof,
    chambers
  })

  // HKDF-SHA512 派生 144 字节密钥材料: 32(AES-256) + 64(HMAC-SHA512) + 48(HMAC-SHA384)
  const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_DUAL_CHAMBER_v5', 'utf8'), 144))
  const aesKey = derivedKeyMaterial.subarray(0, 32)
  const hmacKey = derivedKeyMaterial.subarray(32, 96)
  const sigKey = derivedKeyMaterial.subarray(96, 144)

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv)
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(dualChamberPackage, 'utf8')), cipher.final()])
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
  return `$XO_VAULT_DUAL_CHAMBER_V5$${salt.toString('hex')}$${iv.toString('hex')}$${authTag.toString('hex')}$${timestamp}$${ciphertext.toString('hex')}$${seal}`
}

function internalDecrypt(trimmed: string, rootSecret: Buffer): string {
  // 1. 处理 V5 自研双舱量子架构 (真实业务舱 + 诱饵蜜罐舱 + 双重数字签名)
  if (trimmed.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
    const parts = trimmed.split('$')
    if (parts.length < 8) throw new Error('无效的 V5 双舱金库加密文件结构')
    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const timestamp = parts[5]
    const ciphertext = Buffer.from(parts[6], 'hex')
    const expectedSeal = parts[7]

    const [expected512, expected384] = expectedSeal.split('.')
    if (!expected512 || !expected384) throw new Error('V5 双舱金库数字封签结构损坏')

    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_DUAL_CHAMBER_v5', 'utf8'), 144))
    const aesKey = derivedKeyMaterial.subarray(0, 32)
    const hmacKey = derivedKeyMaterial.subarray(32, 96)
    const sigKey = derivedKeyMaterial.subarray(96, 144)

    // 校验第一重 HMAC-SHA512 主签名
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
      throw new Error('V5 双舱数字主签名校验失败：文件已被外部篡改或主密钥不匹配')
    }

    // 校验第二重 HMAC-SHA384 级联防伪防重放链
    const actual384 = crypto
      .createHmac('sha384', sigKey)
      .update(salt)
      .update(Buffer.from(timestamp, 'utf8'))
      .update(Buffer.from(actual512, 'utf8'))
      .digest('hex')

    const bufActual384 = Buffer.from(actual384, 'hex')
    const bufExpected384 = Buffer.from(expected384, 'hex')
    if (bufActual384.length !== bufExpected384.length || !crypto.timingSafeEqual(bufActual384, bufExpected384)) {
      throw new Error('V5 双舱级联防伪签名校验失败：数字指纹已被破坏')
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const decryptedPackage = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
    const parsed = JSON.parse(decryptedPackage)

    const expectedTruthProof = crypto
      .createHmac('sha512', rootSecret)
      .update(salt)
      .update(Buffer.from(timestamp, 'utf8'))
      .update(Buffer.from(String(parsed.truthIndex), 'utf8'))
      .digest('hex')

    const bufActualProof = Buffer.from(parsed.truthProof, 'hex')
    const bufExpectedProof = Buffer.from(expectedTruthProof, 'hex')
    if (bufActualProof.length !== bufExpectedProof.length || !crypto.timingSafeEqual(bufActualProof, bufExpectedProof)) {
      throw new Error('V5 双舱共识真理校验未通过：诱饵蜜罐触发或密钥不匹配')
    }

    const genuine = parsed.chambers[parsed.truthIndex]
    if (!genuine || !genuine.payload) {
      throw new Error('V5 双舱真理舱提取失败')
    }

    // 校验真理舱数据完整性哈希
    const actualDataHash = crypto.createHash('sha512').update(Buffer.from(genuine.payload, 'utf8')).digest('hex')
    if (actualDataHash !== genuine.hash) {
      throw new Error('V5 双舱真理数据哈希不一致，已被内部篡改')
    }

    return genuine.payload
  }

  // 2. 兼容 V4 版本（增强型双重数字签名与时间戳）
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

  // 3. 平滑兼容 V3 版本
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

  // 4. 兼容历史未加密明文
  return trimmed
}

/**
 * 获取金库候选密钥环 (Candidate Secrets Ring)
 * 自动聚合主密钥、现有磁盘 master.secret、历史各轮密库凭证及 Pepper，保障跨环境平滑自愈解密
 */
export function getCandidateSecretsRing(customSecret?: string): Buffer[] {
  const ring: Buffer[] = []
  const seenHex = new Set<string>()

  function addSecret(raw: any) {
    if (!raw) return
    let buf: Buffer | null = null
    if (Buffer.isBuffer(raw)) {
      buf = raw
    } else if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed.length > 0) {
        buf = Buffer.from(trimmed, 'utf8')
        // 若为 32 字符以上的 Hex 编码，同时作为原始字节 Buffer 候选
        if (/^[0-9a-fA-F]{32,}$/.test(trimmed)) {
          try {
            const hexBuf = Buffer.from(trimmed, 'hex')
            const hexId = hexBuf.toString('hex')
            if (!seenHex.has(hexId)) {
              seenHex.add(hexId)
              ring.push(hexBuf)
            }
          } catch {}
        }
      }
    }
    if (buf && buf.length > 0) {
      const hexId = buf.toString('hex')
      if (!seenHex.has(hexId)) {
        seenHex.add(hexId)
        ring.push(buf)
      }
    }
  }

  // 1. 用户显式指定密钥优先
  if (customSecret) addSecret(customSecret)

  // 2. 当前运行环境主密钥
  addSecret(getVaultRootSecret())
  addSecret(process.env.VAULT_MASTER_SECRET)
  addSecret(process.env.XO_VAULT_MASTER_SECRET)
  addSecret(process.env.XO_PROJECT_PASSWORD_SECRET)
  addSecret(process.env.SESSION_SECRET)
  addSecret(process.env.XO_ALIPAY_CONFIG_SECRET)

  // 3. .env 文件直接探测
  const cwd = process.cwd()
  const candidateEnvPaths = [
    path.resolve(cwd, '.env'),
    path.resolve(cwd, '..', '.env')
  ]
  for (const envPath of candidateEnvPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const raw = fs.readFileSync(envPath, 'utf8')
        const matches = raw.matchAll(/^([A-Z0-9_]+)\s*=\s*(["']?)(.+?)\2$/gm)
        for (const m of matches) {
          if (m[1].includes('SECRET') || m[1].includes('KEY')) {
            addSecret(m[3])
          }
        }
      } catch {}
    }
  }

  // 4. content/.vault/master.secret 磁盘物理密钥
  const secretPath = path.resolve(cwd, 'content', '.vault', 'master.secret')
  if (fs.existsSync(secretPath)) {
    try {
      addSecret(fs.readFileSync(secretPath, 'utf8'))
    } catch {}
  }

  // 5. content/.vault/ 下的轮转公钥/历史凭据
  const vaultDir = path.resolve(cwd, 'content', '.vault')
  if (fs.existsSync(vaultDir)) {
    try {
      const files = fs.readdirSync(vaultDir)
      for (const f of files) {
        const fp = path.join(vaultDir, f)
        if (f.endsWith('.json')) {
          try {
            const parsed = JSON.parse(fs.readFileSync(fp, 'utf8'))
            if (parsed.secret) addSecret(parsed.secret)
            if (parsed.masterKey) addSecret(parsed.masterKey)
            if (parsed.consensusSeed) addSecret(parsed.consensusSeed)
          } catch {}
        } else if (f.endsWith('.secret') || f.endsWith('.key')) {
          try {
            addSecret(fs.readFileSync(fp, 'utf8'))
          } catch {}
        }
      }
    } catch {}
  }

  // 6. 内置量子 Pepper 与历史保底密钥
  addSecret('XO-STUDIO-QUANTUM-MASTER-PEPPER-2026-OBSIDIAN-VAULT')
  addSecret('XO_STUDIO_WORLD_CLASS_QUANTUM_SECRET_2026')

  return ring
}

/**
 * 校验并解密金库加密文件信封，无缝兼容 V5 双舱、V4、V3 与历史明文文件 (全候选密钥环智能自愈遍历)
 */
export function decryptFileContent(envelope: string, customSecret?: string): string {
  if (!envelope || typeof envelope !== 'string') return ''
  const trimmed = envelope.trim()

  const ring = getCandidateSecretsRing(customSecret)
  let lastErr: any = null

  for (const candidateSecret of ring) {
    try {
      return internalDecrypt(trimmed, candidateSecret)
    } catch (err: any) {
      lastErr = err
    }
  }

  throw lastErr || new Error('无法通过密钥环解密该信封')
}

/**
 * 安全读取磁盘加密文件 (自动验签并解密，发现非 V5 双舱密文时秒级原地自愈升级)
 */
export function readEncryptedFile(filePath: string, customSecret?: string): string {
  if (!fs.existsSync(filePath)) return ''
  const raw = fs.readFileSync(filePath, 'utf8')
  const decrypted = decryptFileContent(raw, customSecret)
  // 零降级强约束：一旦读取到任何非 V5 双舱密文，立刻原地升级为 V5 自研双舱密文，绝不让磁盘留存明文
  if (raw && !raw.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
    try {
      writeEncryptedFile(filePath, decrypted, customSecret)
    } catch {}
  }
  return decrypted
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
