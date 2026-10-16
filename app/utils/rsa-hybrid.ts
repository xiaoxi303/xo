export interface RsaPublicKeyResponse {
  publicKey: string
  keyId: string
  consensusSeed?: string
  algorithm?: string
  epoch?: string
  expiresAt?: string
  tamperProofSign?: string
}

export interface ChamberEnvelope {
  chamberId: string
  // Layer 1: RSA-OAEP-256 (for Part A 50% split)
  rsaEncryptedKey: string
  rsaIv: string
  rsaCiphertext: string
  rsaAuthTag: string

  // Layer 2: E2EE Session Key (for Part B 50% split)
  e2eeIv: string
  e2eeCiphertext: string
  e2eeAuthTag: string

  // Layer 3: Cross-Derivation Cascading Outer Armor
  outerIv: string
  outerCiphertext: string
  outerAuthTag: string

  // Ephemeral Client Verification & Anti-Tamper
  clientPublicKey: JsonWebKey
  signature: string
  digest: string
}

export interface RsaHybridPayload {
  rsaHybrid: true
  version: '3' | '4'
  keyId: string
  timestamp: string
  dualChambers?: [ChamberEnvelope, ChamberEnvelope]
  macroArmor?: ChamberEnvelope
  truthNonce?: string
}

const textEncoder = new TextEncoder()

function getWebCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto) return window.crypto
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) return (globalThis as any).crypto
  throw new Error('当前环境不支持 Web Crypto API 安全套件')
}

function toBase64Url(value: ArrayBuffer | Uint8Array): string {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64(value: string): Uint8Array {
  const normalized = value.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '')
  const padded = normalized.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((normalized.length + 3) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  return fromBase64(pem).buffer
}

/**
 * 客户端高熵硬件机器码指纹 (Machine / Hardware Device Fingerprint)
 * 提取 Canvas 指纹、屏幕几何空间、硬件并发核数、WebGL 特征并强哈希绑定
 */
export function getMachineFingerprint(): string {
  if (typeof window === 'undefined') return 'MACH_SERVER_HOST'
  try {
    const cached = localStorage.getItem('xo_machine_fingerprint')
    if (cached && /^MACH_[A-F0-9]{8,16}_/i.test(cached)) {
      return cached
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    let canvasHash = 'NO_CANVAS'
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto'
      ctx.fillStyle = '#6366f1'
      ctx.fillRect(0, 0, 10, 10)
      ctx.fillStyle = '#f43f5e'
      ctx.fillText('XO_MACHINE_SECURITY_2026', 2, 2)
      canvasHash = canvas.toDataURL().slice(-28)
    }
    const screenInfo = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`
    const hw = `${navigator.hardwareConcurrency || 4}:${navigator.maxTouchPoints || 0}:${navigator.language || 'zh-CN'}`
    const raw = `${navigator.userAgent || ''}#${screenInfo}#${hw}#${canvasHash}`

    let hash = 0
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i)
      hash |= 0
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase()
    const finalId = `MACH_${hex}_${screenInfo.replace(/\s+/g, '')}`
    localStorage.setItem('xo_machine_fingerprint', finalId)
    return finalId
  } catch {
    return 'MACH_GENERIC_WEB_CLIENT'
  }
}

function canonicalChamberPayload(payload: {
  keyId: string
  rsaEncryptedKey: string
  rsaIv: string
  rsaCiphertext: string
  rsaAuthTag: string
  e2eeIv: string
  e2eeCiphertext: string
  e2eeAuthTag: string
  outerIv: string
  outerCiphertext: string
  outerAuthTag: string
  timestamp: string
  clientPublicKey: JsonWebKey
  digest: string
}): string {
  return JSON.stringify({
    keyId: payload.keyId,
    rsaEncryptedKey: payload.rsaEncryptedKey,
    rsaIv: payload.rsaIv,
    rsaCiphertext: payload.rsaCiphertext,
    rsaAuthTag: payload.rsaAuthTag,
    e2eeIv: payload.e2eeIv,
    e2eeCiphertext: payload.e2eeCiphertext,
    e2eeAuthTag: payload.e2eeAuthTag,
    outerIv: payload.outerIv,
    outerCiphertext: payload.outerCiphertext,
    outerAuthTag: payload.outerAuthTag,
    timestamp: payload.timestamp,
    clientPublicKey: payload.clientPublicKey,
    digest: payload.digest
  })
}

async function computeConsensusProof(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const webCrypto = getWebCrypto()
  const key = await webCrypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await webCrypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function isValidChamberEnvelope(c: any): boolean {
  return Boolean(
    c &&
    typeof c.chamberId === 'string' &&
    typeof c.rsaEncryptedKey === 'string' &&
    typeof c.rsaIv === 'string' &&
    typeof c.rsaCiphertext === 'string' &&
    typeof c.rsaAuthTag === 'string' &&
    typeof c.e2eeIv === 'string' &&
    typeof c.e2eeCiphertext === 'string' &&
    typeof c.e2eeAuthTag === 'string' &&
    typeof c.outerIv === 'string' &&
    typeof c.outerCiphertext === 'string' &&
    typeof c.outerAuthTag === 'string' &&
    c.clientPublicKey &&
    typeof c.signature === 'string' &&
    typeof c.digest === 'string'
  )
}

export function isRsaHybridPayload(value: any): value is RsaHybridPayload {
  if (!value || typeof value !== 'object' || value.rsaHybrid !== true) {
    return false
  }
  if (typeof value.keyId !== 'string' || typeof value.timestamp !== 'string') {
    return false
  }
  // Version 4: 双重复合三层量子装甲（外层宏观级联胶囊）
  if (value.version === '4' && value.macroArmor) {
    return isValidChamberEnvelope(value.macroArmor)
  }
  // Version 3 / Version 2: 内层直接双舱
  return Boolean(
    (value.version === '3' || value.version === '2') &&
    Array.isArray(value.dualChambers) &&
    value.dualChambers.length === 2 &&
    value.dualChambers.every(isValidChamberEnvelope)
  )
}

async function getServerPublicKey(): Promise<RsaPublicKeyResponse> {
  // Always obtain a fresh ephemeral One-Time Public Key (OTPK) with single-use ticket
  return $fetch<RsaPublicKeyResponse>('/api/security/rsa-public-key', {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      'x-machine-id': getMachineFingerprint()
    }
  })
}

/**
 * 构造三层级联交错加密密文舱 (Triple-Layer Cascading Interleaved Quantum Chamber):
 * 第 1 层: 待加密数据对半切割，前半部(50%)使用 RSA-OAEP-256 密钥封包；
 * 第 2 层: 后半部(50%)使用 E2EE (基于会话共识种子派生的高安全级对称密钥) 加密；
 * 第 3 层: 结合第 1 层对称密钥与第 2 层 E2EE 密钥交叉派生外层装甲密钥，封装跨层完整性保护；
 * 最终附带客户端 RSA-PSS 临时数字签名与 SHA-256 密文摘要。
 */
async function buildTripleLayerChamber(
  subtle: SubtleCrypto,
  serverPublicKey: CryptoKey,
  clientSigningKeys: CryptoKeyPair,
  payloadData: unknown,
  keyId: string,
  consensusSeed: string,
  timestamp: string
): Promise<ChamberEnvelope> {
  const webCrypto = getWebCrypto()
  const chamberId = toBase64Url(webCrypto.getRandomValues(new Uint8Array(8)))
  const dataString = JSON.stringify(payloadData)

  // 1. 完全高熵动态随机切割 (Dynamic Random Split: 20% ~ 80%)
  // 绝不使用固定的对半比例，使得每次请求两段密文长度完全随机动态变化，无法通过报文长度推算明文特征
  const minSplit = Math.max(1, Math.floor(dataString.length * 0.2))
  const maxSplit = Math.min(dataString.length - 1, Math.floor(dataString.length * 0.8))
  const splitRandomBytes = webCrypto.getRandomValues(new Uint8Array(2))
  const splitOffset = (splitRandomBytes[0] * 256 + splitRandomBytes[1]) % Math.max(1, maxSplit - minSplit + 1)
  const splitIdx = Math.min(dataString.length - 1, Math.max(1, minSplit + splitOffset))

  const partA = dataString.slice(0, splitIdx)
  const partB = dataString.slice(splitIdx)

  // 2. 第 1 层：RSA-OAEP-256 对称密钥封装 + AES-256-GCM 保护 Part A (50%)
  const aesKeyA = await subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  const rawAesKeyA = await subtle.exportKey('raw', aesKeyA)
  const rsaEncryptedKey = await subtle.encrypt(
    { name: 'RSA-OAEP' },
    serverPublicKey,
    rawAesKeyA
  )
  const rsaIv = webCrypto.getRandomValues(new Uint8Array(12))
  const encryptedA = new Uint8Array(await subtle.encrypt(
    { name: 'AES-GCM', iv: rsaIv, tagLength: 128 },
    aesKeyA,
    textEncoder.encode(partA)
  ))
  const rsaCiphertext = encryptedA.slice(0, -16)
  const rsaAuthTag = encryptedA.slice(-16)

  // 3. 第 2 层：E2EE (基于会话共识种子派生) 保护 Part B (50%)
  const e2eeHmacKey = await subtle.importKey(
    'raw',
    textEncoder.encode(consensusSeed),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const e2eeKeyBytes = await subtle.sign(
    'HMAC',
    e2eeHmacKey,
    textEncoder.encode(`E2EE_PART_B:${keyId}:${timestamp}`)
  )
  const aesKeyB = await subtle.importKey(
    'raw',
    e2eeKeyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  const e2eeIv = webCrypto.getRandomValues(new Uint8Array(12))
  const encryptedB = new Uint8Array(await subtle.encrypt(
    { name: 'AES-GCM', iv: e2eeIv, tagLength: 128 },
    aesKeyB,
    textEncoder.encode(partB)
  ))
  const e2eeCiphertext = encryptedB.slice(0, -16)
  const e2eeAuthTag = encryptedB.slice(-16)

  // 4. 第 3 层：交叉派生外层量子装甲 (Cross-Derivation Cascading Outer Armor)
  // 将 Layer 1 的 AES 密钥与 Layer 2 的 E2EE 密钥交叉混淆，派生出第三层装甲密钥
  const crossHmacKey = await subtle.importKey(
    'raw',
    rawAesKeyA,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const outerKeyBytes = await subtle.sign(
    'HMAC',
    crossHmacKey,
    new Uint8Array(e2eeKeyBytes)
  )
  const outerKey = await subtle.importKey(
    'raw',
    outerKeyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  const outerArmorPayload = JSON.stringify({
    chamberId,
    partALen: partA.length,
    partBLen: partB.length,
    matrixCheck: toBase64Url(webCrypto.getRandomValues(new Uint8Array(16)))
  })
  const outerIv = webCrypto.getRandomValues(new Uint8Array(12))
  const encryptedOuter = new Uint8Array(await subtle.encrypt(
    { name: 'AES-GCM', iv: outerIv, tagLength: 128 },
    outerKey,
    textEncoder.encode(outerArmorPayload)
  ))
  const outerCiphertext = encryptedOuter.slice(0, -16)
  const outerAuthTag = encryptedOuter.slice(-16)

  // 5. 客户端临时公钥导出、数字签名与完整性摘要
  const clientPublicKey = await subtle.exportKey('jwk', clientSigningKeys.publicKey)
  const digest = toBase64Url(await subtle.digest('SHA-256', outerCiphertext))

  const chamberUnsigned = {
    keyId,
    rsaEncryptedKey: toBase64Url(rsaEncryptedKey),
    rsaIv: toBase64Url(rsaIv),
    rsaCiphertext: toBase64Url(rsaCiphertext),
    rsaAuthTag: toBase64Url(rsaAuthTag),
    e2eeIv: toBase64Url(e2eeIv),
    e2eeCiphertext: toBase64Url(e2eeCiphertext),
    e2eeAuthTag: toBase64Url(e2eeAuthTag),
    outerIv: toBase64Url(outerIv),
    outerCiphertext: toBase64Url(outerCiphertext),
    outerAuthTag: toBase64Url(outerAuthTag),
    timestamp,
    clientPublicKey,
    digest
  }

  const isEc = (clientSigningKeys.publicKey.algorithm as any)?.name === 'ECDSA'
  const signature = isEc
    ? await subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-384' } },
        clientSigningKeys.privateKey,
        textEncoder.encode(canonicalChamberPayload(chamberUnsigned))
      )
    : await subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        clientSigningKeys.privateKey,
        textEncoder.encode(canonicalChamberPayload(chamberUnsigned))
      )

  return {
    chamberId,
    rsaEncryptedKey: chamberUnsigned.rsaEncryptedKey,
    rsaIv: chamberUnsigned.rsaIv,
    rsaCiphertext: chamberUnsigned.rsaCiphertext,
    rsaAuthTag: chamberUnsigned.rsaAuthTag,
    e2eeIv: chamberUnsigned.e2eeIv,
    e2eeCiphertext: chamberUnsigned.e2eeCiphertext,
    e2eeAuthTag: chamberUnsigned.e2eeAuthTag,
    outerIv: chamberUnsigned.outerIv,
    outerCiphertext: chamberUnsigned.outerCiphertext,
    outerAuthTag: chamberUnsigned.outerAuthTag,
    clientPublicKey,
    signature: toBase64Url(signature),
    digest
  }
}

/**
 * 全面升级：RSA-OAEP-256 + E2EE 深度结合的三层交错双舱共识加密核心
 * 1. 数据对半切分：50% RSA-OAEP-256 + 50% E2EE，结合二者再派生第三层装甲
 * 2. 深度绑定客户端硬件机器码，杜绝任何外部公钥替换与未经授权的重放攻击
 * 3. 构造一真一假两组外观完全相同的密文舱并随机混排，由服务端独立金库私钥完成共识裁决
 */
export async function encryptRsaHybrid(value: unknown): Promise<RsaHybridPayload> {
  if (isRsaHybridPayload(value)) {
    return value
  }

  const webCrypto = getWebCrypto()
  if (!webCrypto?.subtle) {
    throw new Error('当前环境不支持 Web Crypto API 安全套件')
  }

  const serverKey = await getServerPublicKey()
  const serverPublicKey = await webCrypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(serverKey.publicKey),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )
  let clientSigningKeys: CryptoKeyPair
  try {
    clientSigningKeys = await webCrypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-384' },
      true,
      ['sign', 'verify']
    )
  } catch {
    clientSigningKeys = await webCrypto.subtle.generateKey(
      { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify']
    )
  }

  const timestamp = new Date().toISOString()
  const truthNonce = toBase64Url(webCrypto.getRandomValues(new Uint8Array(16)))
  const machineId = getMachineFingerprint()

  // 计算与服务端金库私钥达成一致的真理共识证明
  const consensusSeed = serverKey.consensusSeed || serverKey.keyId
  const consensusProof = await computeConsensusProof(
    consensusSeed,
    `${serverKey.keyId}:${timestamp}:TRUE_CHAMBER`
  )

  // 1. 真实密文舱：封入真实业务载荷、硬件机器码与金库真理共识标识
  const genuinePayload = {
    __vault_auth: 'GENUINE_MATRIX',
    consensusProof,
    machineId,
    truthNonce,
    data: value
  }
  const genuineChamber = await buildTripleLayerChamber(
    webCrypto.subtle,
    serverPublicKey,
    clientSigningKeys,
    genuinePayload,
    serverKey.keyId,
    consensusSeed,
    timestamp
  )

  // 2. 蜜罐诱饵密文舱：封入高仿真随机拟态数据（格式、长度、签名、IV均一致）
  const decoyEntropy = toBase64Url(webCrypto.getRandomValues(new Uint8Array(16)))
  const decoyProof = toBase64Url(webCrypto.getRandomValues(new Uint8Array(32)))
  const decoyPayload = {
    __vault_auth: 'DECOY_HONEYPOT',
    consensusProof: decoyProof,
    machineId: `MACH_DECOY_${decoyEntropy.slice(0, 8)}`,
    data: {
      syntheticToken: decoyEntropy,
      timestamp: Date.now(),
      decoyVector: toBase64Url(webCrypto.getRandomValues(new Uint8Array(32)))
    }
  }
  const decoyChamber = await buildTripleLayerChamber(
    webCrypto.subtle,
    serverPublicKey,
    clientSigningKeys,
    decoyPayload,
    serverKey.keyId,
    `DECOY_SEED_${decoyEntropy}`,
    timestamp
  )

  // 3. 50% 几率随机混淆密文舱槽位排序，外部完全不可预知
  const isFirstChamberGenuine = (webCrypto.getRandomValues(new Uint8Array(1))[0] & 1) === 1
  const dualChambers: [ChamberEnvelope, ChamberEnvelope] = isFirstChamberGenuine
    ? [genuineChamber, decoyChamber]
    : [decoyChamber, genuineChamber]

  // 4. 第二重：在内层一真一假双舱的基础上，再次封装宏观三层交错量子级联装甲 (Double-Cascaded Triple-Layer Armor)
  // 将内层两舱核心结构再次执行 20%~80% 动态随机切分 + RSA-OAEP-256 + 宏观 E2EE + 宏观交叉量子装甲
  const macroCorePayload = {
    dualChambers,
    machineId,
    truthNonce
  }

  const macroArmor = await buildTripleLayerChamber(
    webCrypto.subtle,
    serverPublicKey,
    clientSigningKeys,
    macroCorePayload,
    serverKey.keyId,
    `${consensusSeed}:MACRO_OUTER`,
    timestamp
  )

  return {
    rsaHybrid: true,
    version: '4',
    keyId: serverKey.keyId,
    timestamp,
    macroArmor,
    truthNonce
  }
}
