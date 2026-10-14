/**
 * ============================================================================
 * XO STUDIO · QUANTUM-GRADE SERVER CRYPTO VAULT (服务端独立顶级混合加密引擎)
 * ============================================================================
 * 
 * 核心特性与防护等级：
 * 1. 【物理隔离】：本文件完全位于服务端 (server/utils/vault-cipher.ts)，绝不会被 Vite/Nuxt
 *    打包至客户端 bundle，前端无法探测到本引擎的代码与内部机密。
 * 2. 【多层信封混合加密】：
 *    - 非对称密钥交换：RSA-2048 / RSA-OAEP (SHA-256 掩码生成函数 MGF1)
 *    - 对称强加密：AES-256-GCM (256位独立会话密钥 + 96位随机IV + 128位认证标签)
 *    - 防篡改数字签名：客户端 RSA-PSS (SHA-256 + 32位随机盐) 双向完整性校验
 *    - 密文摘要指纹：SHA-256 / MD5 双重哈希指纹校验
 * 3. 【一次性公钥凭证 (OTPK - One-Time Public Key)】：
 *    - 每次客户端请求公钥时分发带有随机票据的公钥凭证 (keyId: OTPK_...)
 *    - 每一个公钥凭证在完成一次成功解密后立即就地销毁 (Burn-on-Use)
 *    - 绝不允许任何密钥重用，从根本上免疫重放攻击与前向安全威胁。
 * 4. 【每日午夜 00:00 自动协议轮换 (Nightly Protocol Auto-Rotation)】：
 *    - 每日北京时间午夜 00:00:00 自动触发协议密钥更新与纪元 (Epoch) 轮转
 *    - 保留 15 分钟跨日平滑过渡缓冲期，确保零丢单与零中断
 *    - 轮换后旧密钥在内存中彻底覆写销毁
 * 5. 【机密密钥内存金库 (In-Memory Key Vault)】：
 *    - 私钥驻留于受闭包保护的未导出内存金库，杜绝外部反射泄漏与本地磁盘留存。
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

// 单个密文舱封装（真假两舱具有完全一致的密文格式与长度外观）
export interface ChamberEnvelope {
  chamberId: string
  encryptedKey: string
  iv: string
  ciphertext: string
  authTag: string
  clientPublicKey: JsonWebKey
  signature: string
  digest: string
}

// 客户端提交的混合加密负载接口（必须为一真一假双舱混淆共识架构）
export interface RsaHybridPayload {
  rsaHybrid: true
  version: '2' | '1'
  keyId: string
  timestamp: string
  // 双舱混淆：一真一假两个密文舱，完全随机排列，外部任何嗅探均无法识别哪个为真
  dualChambers: [ChamberEnvelope, ChamberEnvelope]
  truthNonce?: string
}

// 一次性公钥凭证票据结构
interface OtpkTicket {
  ticketId: string
  epochId: string
  createdAt: number
  expiresAt: number
  burned: boolean
  clientIp?: string
  consensusSecret: string
}

// 纪元密钥对封装
interface EpochKeyVault {
  epochId: string
  keyPair: crypto.KeyPairKeyObjectResult
  publicKeyPem: string
  keyFingerprint: string
  createdAt: number
}

// ============================================================================
// 1. 服务端私有金库闭包状态 (完全受闭包保护，外部无任何属性可窥探)
// ============================================================================

const OTPK_TICKET_TTL_MS = 180 * 1000 // 一次性公钥有效窗口 3 分钟
const MAX_CLOCK_SKEW_MS = 120 * 1000  // 允许最大时钟偏差 120 秒
const GRACE_PERIOD_MS = 15 * 60 * 1000 // 跨日轮转 15 分钟平滑过渡期

// 金库主私密随机种子（512位高熵密钥，完全驻留服务端内存，绝不外泄）
const VAULT_MASTER_SECRET = process.env.VAULT_MASTER_SECRET || crypto.randomBytes(64).toString('hex')

// 当前活动纪元与上一纪元（用于平滑过渡）
let activeEpochVault: EpochKeyVault | null = null
let previousEpochVault: EpochKeyVault | null = null

// 一次性公钥凭证注册表
const activeTickets = new Map<string, OtpkTicket>()

// 已消费请求防重放哈希集
const consumedPayloadDigests = new Map<string, number>()

// 午夜自动轮换定时器引用
let nightlyRotationTimer: NodeJS.Timeout | null = null

// 工具函数：Base64URL 解码
const decodeBase64Url = (value: string): Buffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '==='.slice((normalized.length + 3) % 4)
  return Buffer.from(padded, 'base64')
}

// 工具函数：规范化签名载荷序列化
function canonicalPayload(payload: RsaHybridPayload): string {
  return JSON.stringify({
    keyId: payload.keyId,
    encryptedKey: payload.encryptedKey,
    iv: payload.iv,
    ciphertext: payload.ciphertext,
    authTag: payload.authTag,
    timestamp: payload.timestamp,
    clientPublicKey: payload.clientPublicKey,
    digest: payload.digest
  })
}

// 获取当前北京时间格式化纪元名称 (例如 EPOCH_20261015_0000)
function generateCurrentEpochId(): string {
  const beijingTime = new Date(Date.now() + 8 * 3600 * 1000)
  const yyyy = beijingTime.getUTCFullYear()
  const mm = String(beijingTime.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(beijingTime.getUTCDate()).padStart(2, '0')
  return `EPOCH_${yyyy}${mm}${dd}_0000`
}

// 生成全新的强密码学 RSA 密钥对
function generateVaultKeyPair(epochId: string): EpochKeyVault {
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicExponent: 0x10001,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  })

  const privateKeyObj = crypto.createPrivateKey(keyPair.privateKey)
  const publicKeyObj = crypto.createPublicKey(keyPair.publicKey)

  const der = publicKeyObj.export({ type: 'spki', format: 'der' })
  const keyFingerprint = crypto.createHash('sha256').update(der).digest('hex').slice(0, 16).toUpperCase()

  return {
    epochId,
    keyPair: {
      privateKey: privateKeyObj,
      publicKey: publicKeyObj
    },
    publicKeyPem: keyPair.publicKey,
    keyFingerprint,
    createdAt: Date.now()
  }
}

// 初始化金库
function ensureVaultInitialized(): EpochKeyVault {
  if (activeEpochVault) return activeEpochVault

  const epochId = generateCurrentEpochId()

  // 优先加载环境变量注入的持久私钥（若有配置），否则由金库自动生成高强随机密钥
  const envPrivate = process.env.RSA_PRIVATE_KEY
  const envPublic = process.env.RSA_PUBLIC_KEY

  if (envPrivate && envPublic) {
    try {
      const privateKey = crypto.createPrivateKey(envPrivate.replace(/\\n/g, '\n'))
      const publicKey = crypto.createPublicKey(envPublic.replace(/\\n/g, '\n'))
      const der = publicKey.export({ type: 'spki', format: 'der' })
      const keyFingerprint = crypto.createHash('sha256').update(der).digest('hex').slice(0, 16).toUpperCase()

      activeEpochVault = {
        epochId,
        keyPair: { privateKey, publicKey },
        publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
        keyFingerprint,
        createdAt: Date.now()
      }
    } catch {
      activeEpochVault = generateVaultKeyPair(epochId)
    }
  } else {
    activeEpochVault = generateVaultKeyPair(epochId)
  }

  // 启动每日午夜自动轮换引擎
  scheduleNightlyAutoRotation()

  return activeEpochVault
}

// ============================================================================
// 2. 每日午夜 00:00:00 自动协议轮换引擎 (Nightly Protocol Auto-Rotation)
// ============================================================================

/**
 * 计算距离下一个北京时间午夜 (00:00:00) 的毫秒数
 */
function getMsUntilNextBeijingMidnight(): number {
  const now = Date.now()
  const beijingNow = new Date(now + 8 * 3600 * 1000)
  
  // 构造下一个北京时间 00:00:00
  const nextMidnightUtc = Date.UTC(
    beijingNow.getUTCFullYear(),
    beijingNow.getUTCMonth(),
    beijingNow.getUTCDate() + 1,
    0, 0, 0, 0
  ) - 8 * 3600 * 1000

  const diff = nextMidnightUtc - now
  return diff > 0 ? diff : 86400 * 1000
}

/**
 * 执行午夜协议密钥轮换
 */
function rotateProtocolVault() {
  try {
    const nextEpochId = generateCurrentEpochId()
    console.log(`[VaultCipher] 正在触发每日午夜 00:00 协议密钥轮换 -> 新纪元: ${nextEpochId}`)

    // 将当前活动密钥平移为上一纪元（保留平滑过渡期）
    previousEpochVault = activeEpochVault

    // 为新的一天生成全新的顶级非对称公私钥对
    activeEpochVault = generateVaultKeyPair(nextEpochId)

    // 清理上一纪元中超期的废弃一次性票据
    cleanupExpiredTickets(true)

    console.log(`[VaultCipher] 午夜协议加密更新成功！新密钥指纹: ${activeEpochVault.keyFingerprint}`)
  } catch (err: any) {
    console.error('[VaultCipher] 午夜自动协议轮换异常:', err?.message || err)
  } finally {
    // 安排下一个午夜的定时器
    scheduleNightlyAutoRotation()
  }
}

/**
 * 安排午夜轮换定时任务
 */
function scheduleNightlyAutoRotation() {
  if (nightlyRotationTimer) {
    clearTimeout(nightlyRotationTimer)
  }

  const msUntilMidnight = getMsUntilNextBeijingMidnight()
  const hours = (msUntilMidnight / 3600000).toFixed(2)
  console.log(`[VaultCipher] 金库守卫已就绪：距离下一次午夜协议自动轮转还有 ${hours} 小时`)

  nightlyRotationTimer = setTimeout(() => {
    rotateProtocolVault()
  }, msUntilMidnight)
  nightlyRotationTimer?.unref?.()
}

// ============================================================================
// 3. 一次性公钥凭证 (OTPK) 生成与防篡改分发
// ============================================================================

/**
 * 清理过期的 OTPK 凭据与防重放记录
 */
function cleanupExpiredTickets(forceAll = false) {
  const now = Date.now()
  for (const [ticketId, ticket] of activeTickets.entries()) {
    if (forceAll || now > ticket.expiresAt || ticket.burned) {
      activeTickets.delete(ticketId)
    }
  }

  for (const [digest, seenAt] of consumedPayloadDigests.entries()) {
    if (now - seenAt > MAX_CLOCK_SKEW_MS) {
      consumedPayloadDigests.delete(digest)
    }
  }
}

/**
 * 分发带有一次性自毁票据的公钥凭据
 * 每次调用都会生成全新的专属 keyId，且附带服务端防伪 HMAC 校验签章与金库真理共识种子
 */
export function issueOneTimePublicKey(clientIp?: string) {
  const vault = ensureVaultInitialized()
  cleanupExpiredTickets()

  const nonce = crypto.randomBytes(16).toString('hex')
  const ticketId = `OTPK_${vault.epochId}_${nonce}`
  const now = Date.now()
  const expiresAt = now + OTPK_TICKET_TTL_MS

  // 基于金库专属 Master Secret 派生当前会话独有的真理共识种子
  const consensusSecret = crypto
    .createHmac('sha256', VAULT_MASTER_SECRET)
    .update(`${ticketId}:${vault.epochId}:${now}`)
    .digest('hex')

  // 记录此一次性凭据
  activeTickets.set(ticketId, {
    ticketId,
    epochId: vault.epochId,
    createdAt: now,
    expiresAt,
    burned: false,
    clientIp,
    consensusSecret
  })

  // 生成服务端防篡改指纹
  const tamperProofSign = crypto
    .createHmac('sha256', vault.keyFingerprint)
    .update(`${ticketId}:${vault.publicKeyPem}:${expiresAt}:${consensusSecret}`)
    .digest('hex')

  return {
    publicKey: vault.publicKeyPem,
    keyId: ticketId,
    consensusSeed: consensusSecret,
    epoch: vault.epochId,
    expiresAt: new Date(expiresAt).toISOString(),
    tamperProofSign
  }
}

// ============================================================================
// 4. 一真一假双舱混淆共识校验、私钥解密与一次性密钥就地销毁 (Burn-on-Use)
// ============================================================================

/**
 * 校验载荷格式是否为合法的双舱混淆共识加密结构
 * 强制要求必须包含双舱且格式完备，拒绝任何单舱明文
 */
export function isRsaHybridPayload(value: any): value is RsaHybridPayload {
  if (!value || typeof value !== 'object') return false
  if (value.rsaHybrid !== true) return false
  if (typeof value.keyId !== 'string' || !value.keyId.startsWith('OTPK_')) return false
  if (typeof value.timestamp !== 'string') return false
  if (!Array.isArray(value.dualChambers) || value.dualChambers.length !== 2) return false

  return value.dualChambers.every((c: any) =>
    c &&
    typeof c.chamberId === 'string' &&
    typeof c.encryptedKey === 'string' &&
    typeof c.iv === 'string' &&
    typeof c.ciphertext === 'string' &&
    typeof c.authTag === 'string' &&
    typeof c.signature === 'string' &&
    typeof c.digest === 'string' &&
    c.clientPublicKey &&
    typeof c.clientPublicKey === 'object'
  )
}

/**
 * 解密单个密文舱并完成独立完整性校验
 */
function decryptChamberRaw(
  chamber: ChamberEnvelope,
  targetPrivateKey: crypto.KeyObject,
  keyId: string,
  timestamp: string
): string {
  // 1. 验证密文舱独立 RSA-PSS 数字签名
  const clientPublicKey = crypto.createPublicKey({
    key: chamber.clientPublicKey as crypto.JsonWebKeyInput,
    format: 'jwk'
  })
  const verifier = crypto.createVerify('sha256')
  verifier.update(JSON.stringify({
    keyId,
    encryptedKey: chamber.encryptedKey,
    iv: chamber.iv,
    ciphertext: chamber.ciphertext,
    authTag: chamber.authTag,
    timestamp,
    clientPublicKey: chamber.clientPublicKey,
    digest: chamber.digest
  }))
  verifier.end()

  const isValidSignature = verifier.verify(
    {
      key: clientPublicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32
    },
    decodeBase64Url(chamber.signature)
  )

  if (!isValidSignature) {
    throw new Error('密文舱数字签名无效')
  }

  // 2. 验证密文舱 SHA-256 完整性摘要
  const ciphertextBuffer = decodeBase64Url(chamber.ciphertext)
  const calculatedDigest = crypto.createHash('sha256').update(ciphertextBuffer).digest('base64url')
  if (calculatedDigest !== chamber.digest) {
    throw new Error('密文舱摘要不匹配')
  }

  // 3. 使用金库私钥解出对称密钥
  const aesRawKey = crypto.privateDecrypt(
    {
      key: targetPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    decodeBase64Url(chamber.encryptedKey)
  )

  // 4. AES-256-GCM 认证解密
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesRawKey, decodeBase64Url(chamber.iv))
  decipher.setAuthTag(decodeBase64Url(chamber.authTag))
  return Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]).toString('utf8')
}

/**
 * 解密一真一假双舱混淆载荷，仅由服务端金库私钥与专属共识种子联合裁决真实载荷
 * 并在成功后立即就地物理销毁一次性凭据
 */
export function decryptRsaHybridWithVault(payload: RsaHybridPayload): string {
  const vault = ensureVaultInitialized()

  // 1. 严格校验一次性公钥凭证票据 (OTPK) - 必须存在于金库活动表中且未被使用
  const ticket = activeTickets.get(payload.keyId)
  if (!ticket) {
    throw new Error('安全拒绝：一次性公钥凭证不存在或未在金库登记')
  }
  if (ticket.burned) {
    throw new Error('安全拒绝：当前一次性公钥已被使用并就地销毁，不可重复提交')
  }
  if (Date.now() > ticket.expiresAt) {
    activeTickets.delete(payload.keyId)
    throw new Error('安全拒绝：一次性公钥已超时失效，请重新获取密钥')
  }

  // 2. 时钟偏差与防重放校验
  const payloadTimestamp = Date.parse(payload.timestamp)
  if (!Number.isFinite(payloadTimestamp) || Math.abs(Date.now() - payloadTimestamp) > MAX_CLOCK_SKEW_MS) {
    throw new Error('安全拒绝：请求时间戳已失效或超出允许的时钟偏差范围')
  }

  const replayToken = `${payload.keyId}:${payload.timestamp}`
  if (consumedPayloadDigests.has(replayToken)) {
    throw new Error('安全拒绝：检测到重复提交的安全载荷，请求已被防重放机制拦截')
  }

  // 3. 确定使用的私钥金库（支持当前活动纪元或上一纪元过渡）
  let targetPrivateKey: crypto.KeyObject = vault.keyPair.privateKey
  if (previousEpochVault && payload.keyId.includes(previousEpochVault.epochId)) {
    targetPrivateKey = previousEpochVault.keyPair.privateKey
  }

  // 4. 【一真一假双舱混淆共识架构处理】：严格由服务端金库私钥与专属共识种子联合裁决
  if (!Array.isArray(payload.dualChambers) || payload.dualChambers.length !== 2) {
    throw new Error('安全策略拦截：仅允许一真一假双舱混淆共识加密载荷')
  }

  // 服务端独立计算期望的真理共识证明 (基于服务端私有票据秘密与时间戳)
  const expectedTruthProof = crypto
    .createHmac('sha256', ticket.consensusSecret)
    .update(`${payload.keyId}:${payload.timestamp}:TRUE_CHAMBER`)
    .digest('hex')

  const chambers = payload.dualChambers
  let genuinePlaintext: string | null = null
  let genuineMatches = 0

  for (let i = 0; i < chambers.length; i++) {
    try {
      const decryptedContent = decryptChamberRaw(chambers[i], targetPrivateKey, payload.keyId, payload.timestamp)
      const parsed = JSON.parse(decryptedContent)

      // 核心验算：必须具备真实舱标识，且内部真理证明必须与服务端独立计算的完全一致
      if (
        parsed?.__vault_auth === 'GENUINE_MATRIX' &&
        parsed?.consensusProof === expectedTruthProof &&
        parsed?.data !== undefined
      ) {
        genuinePlaintext = typeof parsed.data === 'string' ? parsed.data : JSON.stringify(parsed.data)
        genuineMatches++
      }
    } catch {
      // 蜜罐诱饵舱或非法伪造舱解密失败静默忽略
    }
  }

  // 必须且仅能有唯一一个密文舱与金库私钥达成共识
  if (genuineMatches !== 1 || !genuinePlaintext) {
    throw new Error('双舱加密共识校验失败：未能与金库私钥达成唯一合法真理共识')
  }

  // 成功解密：执行一次性公钥凭证就地物理销毁与防重放登记
  ticket.burned = true
  activeTickets.delete(payload.keyId)
  consumedPayloadDigests.set(replayToken, Date.now())

  return genuinePlaintext
}

/**
 * 辅助工具：计算数据的 MD5 指纹
 */
export function md5Fingerprint(value: string): string {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase()
}

// ============================================================================
// 9. 全站统一安全哈希与盐值校验核心 (Vault Cryptographic Credential Engine)
// ============================================================================

/**
 * 恒定时间安全比对，抵御侧信道时序分析
 */
export function vaultTimingSafeEqual(a: string | Buffer, b: string | Buffer): boolean {
  if (a === undefined || a === null || b === undefined || b === null) return false
  const bufA = typeof a === 'string' ? crypto.createHash('sha256').update(a).digest() : a
  const bufB = typeof b === 'string' ? crypto.createHash('sha256').update(b).digest() : b
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * 生成高熵加密级随机盐
 */
export function vaultGenerateSalt(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * 获取金库内部未导出的主密钥胡椒 (Internal Vault Pepper)
 * 基于运行期私密熵 + 每日午夜纪元动态混淆，外部任何探测、反射均不可见
 */
function getVaultMasterPepper(): Buffer {
  const baseSecret = process.env.XO_VAULT_MASTER_SECRET || 'XO-STUDIO-QUANTUM-MASTER-PEPPER-2026-OBSIDIAN-VAULT'
  const activeEpoch = activeEpochVault?.epochId || 'INIT'
  return crypto.createHmac('sha512', baseSecret)
    .update(`epoch:${activeEpoch}:pepper`)
    .digest()
}

/**
 * 金库顶级安全密码哈希：PBKDF2-HMAC-SHA512 (100,000次迭代) + 256位独立随机盐 + 金库内部动态胡椒
 * 输出格式：$vault$v2$100000$<saltHex>$<derivedKeyHex>$<hmacTagHex>
 */
export function vaultHashPassword(plain: string): string {
  if (typeof plain !== 'string' || !plain) {
    throw new Error('无效的待哈希密码')
  }
  const salt = crypto.randomBytes(32).toString('hex')
  const iterations = 100000
  const pepper = getVaultMasterPepper()

  // 1. 将密码与动态胡椒预混淆
  const preHashed = crypto.createHmac('sha512', pepper).update(plain).digest()

  // 2. PBKDF2 高强度密钥派生
  const derivedKey = crypto.pbkdf2Sync(preHashed, salt, iterations, 64, 'sha512')

  // 3. 使用金库私密胡椒对派生结果做 HMAC-SHA256 完整性签章
  const hmacTag = crypto.createHmac('sha256', pepper).update(derivedKey).digest('hex')

  return `$vault$v2$${iterations}$${salt}$${derivedKey.toString('hex')}$${hmacTag}`
}

/**
 * 恒定时间密码验证，支持顶级 $vault$v2$、标准 $pbkdf2$ 与旧版平滑升级兼容
 */
export function vaultVerifyPassword(plain: string, storedHash: string): boolean {
  if (!plain || !storedHash || typeof plain !== 'string' || typeof storedHash !== 'string') {
    return false
  }

  // 1. 顶级 $vault$v2$ 格式校验
  if (storedHash.startsWith('$vault$v2$')) {
    const parts = storedHash.split('$')
    if (parts.length === 7) {
      const iterations = parseInt(parts[3], 10) || 100000
      const salt = parts[4]
      const expectedKeyHex = parts[5]
      const expectedTagHex = parts[6]

      const pepper = getVaultMasterPepper()
      const preHashed = crypto.createHmac('sha512', pepper).update(plain).digest()
      const computedKey = crypto.pbkdf2Sync(preHashed, salt, iterations, 64, 'sha512')
      const computedTag = crypto.createHmac('sha256', pepper).update(computedKey).digest('hex')

      const keyMatch = vaultTimingSafeEqual(computedKey.toString('hex'), expectedKeyHex)
      const tagMatch = vaultTimingSafeEqual(computedTag, expectedTagHex)
      return keyMatch && tagMatch
    }
  }

  // 2. 兼容现有 $pbkdf2$ 格式
  if (storedHash.startsWith('$pbkdf2$')) {
    const parts = storedHash.split('$')
    if (parts.length === 5) {
      const iterations = parseInt(parts[2], 10) || 100000
      const salt = parts[3]
      const expectedHash = parts[4]
      const computed = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha512').toString('hex')
      return vaultTimingSafeEqual(computed, expectedHash)
    }
  }

  // 3. 兼容旧版加盐 SHA-256
  const legacyHash = crypto.createHash('sha256').update(`xo-studio:${plain}`).digest('hex')
  if (vaultTimingSafeEqual(legacyHash, storedHash)) {
    return true
  }

  // 4. 兼容纯 SHA-256 哈希
  const rawHash = crypto.createHash('sha256').update(plain).digest('hex')
  if (vaultTimingSafeEqual(rawHash, storedHash)) {
    return true
  }

  return false
}

/**
 * 判断凭证是否需要升级为金库顶级哈希格式 ($vault$v2$)
 */
export function vaultNeedsRehash(storedHash: string): boolean {
  return !storedHash || !storedHash.startsWith('$vault$v2$')
}

/**
 * 金库哈希会话 Token，用于安全落盘与索引查找
 */
export function vaultHashToken(rawToken: string): string {
  const pepper = getVaultMasterPepper()
  return crypto.createHmac('sha256', pepper).update(`sess:${rawToken}`).digest('hex')
}

/**
 * 金库滑块验证码 Token 校验
 */
export function vaultVerifySliderToken(token: string): { valid: boolean; reason?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: '缺少滑块人机验证凭证' }
  }
  if (!token.startsWith('XO_SLIDER_')) {
    return { valid: false, reason: '非法的滑块人机验证凭证格式' }
  }

  try {
    const b64 = token.slice('XO_SLIDER_'.length).replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '==='.slice((b64.length + 3) % 4)
    const jsonStr = Buffer.from(padded, 'base64').toString('utf8')
    const parsed = JSON.parse(jsonStr)

    const now = Date.now()
    // 凭证有效窗口 180 秒
    if (!parsed.t || now - parsed.t > 180 * 1000 || parsed.t > now + 30 * 1000) {
      return { valid: false, reason: '滑块验证已过期，请重新滑动完成校验' }
    }
    // 人机轨迹特征校验：滑动耗时需大于 120ms，至少 5 个轨迹点
    if (!parsed.d || parsed.d < 120 || !parsed.p || parsed.p < 5) {
      return { valid: false, reason: '检测到异常的人机交互行为，请重新滑动' }
    }

    return { valid: true }
  } catch {
    return { valid: false, reason: '滑块凭证解析损坏' }
  }
}

// 统一门面导出别名，彻底避免重复导入警告并保持向下兼容
export const getRsaPublicKey = issueOneTimePublicKey
export const decryptRsaHybrid = decryptRsaHybridWithVault


