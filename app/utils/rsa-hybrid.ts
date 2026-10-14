export interface RsaPublicKeyResponse {
  publicKey: string
  keyId: string
  algorithm: string
  epoch?: string
  expiresAt?: string
  tamperProofSign?: string
}

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

export interface RsaHybridPayload {
  rsaHybrid: true
  version: '1'
  algorithm: 'RSA-OAEP-256+AES-256-GCM+RSA-PSS-SHA256'
  keyId: string
  encryptedKey: string
  iv: string
  ciphertext: string
  authTag: string
  timestamp: string
  clientPublicKey: JsonWebKey
  signature: string
  digest: string
  md5?: string
  // 双舱混淆：一真一假两个密文舱，随机混排在数组中
  dualChambers?: [ChamberEnvelope, ChamberEnvelope]
  truthNonce?: string
}

const textEncoder = new TextEncoder()

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

function canonicalPayload(payload: Pick<RsaHybridPayload, 'keyId' | 'encryptedKey' | 'iv' | 'ciphertext' | 'authTag' | 'timestamp' | 'clientPublicKey' | 'digest'>): string {
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

export function isRsaHybridPayload(value: any): value is RsaHybridPayload {
  return Boolean(
    value &&
    typeof value === 'object' &&
    value.rsaHybrid === true &&
    value.version === '1' &&
    value.ciphertext &&
    value.encryptedKey &&
    value.iv &&
    value.authTag &&
    value.signature
  )
}

async function getServerPublicKey(): Promise<RsaPublicKeyResponse> {
  // Always obtain a fresh ephemeral One-Time Public Key (OTPK) with single-use ticket
  return $fetch<RsaPublicKeyResponse>('/api/security/rsa-public-key', {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache'
    }
  })
}

/**
 * 构建单个标准密文舱（无论是真实舱还是拟态诱饵舱，在密文空间表现完全一致）
 */
async function buildSingleChamber(
  subtle: SubtleCrypto,
  publicKey: CryptoKey,
  clientSigningKeys: CryptoKeyPair,
  payloadData: unknown,
  keyId: string,
  timestamp: string
): Promise<ChamberEnvelope> {
  const chamberId = toBase64Url(window.crypto.getRandomValues(new Uint8Array(8)))
  const aesKey = await subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  const rawAesKey = await subtle.exportKey('raw', aesKey)
  const encryptedKey = await subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey
  )

  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encrypted = new Uint8Array(await subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    aesKey,
    textEncoder.encode(JSON.stringify(payloadData))
  ))
  const ciphertext = encrypted.slice(0, -16)
  const authTag = encrypted.slice(-16)
  const clientPublicKey = await subtle.exportKey('jwk', clientSigningKeys.publicKey)
  const digest = toBase64Url(await subtle.digest('SHA-256', ciphertext))

  const chamberUnsigned = {
    keyId,
    encryptedKey: toBase64Url(encryptedKey),
    iv: toBase64Url(iv),
    ciphertext: toBase64Url(ciphertext),
    authTag: toBase64Url(authTag),
    timestamp,
    clientPublicKey,
    digest
  }

  const signature = await subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    clientSigningKeys.privateKey,
    textEncoder.encode(canonicalPayload(chamberUnsigned))
  )

  return {
    chamberId,
    encryptedKey: chamberUnsigned.encryptedKey,
    iv: chamberUnsigned.iv,
    ciphertext: chamberUnsigned.ciphertext,
    authTag: chamberUnsigned.authTag,
    clientPublicKey,
    signature: toBase64Url(signature),
    digest
  }
}

/**
 * 一真一假双舱混合加密 (Dual-Chamber Decoy Hybrid Encryption)
 * 客户端同时构造两个密码学格式完全相同的密文舱，并随机排列顺序；
 * 外部任何抓包嗅探均无法区分真假，最终仅由服务端金库私钥完成核验裁决与真实载荷解包。
 */
export async function encryptRsaHybrid(value: unknown): Promise<RsaHybridPayload> {
  if (isRsaHybridPayload(value)) {
    return value
  }

  if (!import.meta.client || !window.crypto?.subtle) {
    throw new Error('当前浏览器不支持 Web Crypto API')
  }

  const serverKey = await getServerPublicKey()
  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(serverKey.publicKey),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )
  const clientSigningKeys = await window.crypto.subtle.generateKey(
    { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  )

  const timestamp = new Date().toISOString()
  const truthNonce = toBase64Url(window.crypto.getRandomValues(new Uint8Array(16)))

  // 1. 真实密文舱：封入真实数据与金库校验真理 Nonce
  const genuinePayload = {
    __xo_chamber: 'GENUINE_CHAMBER',
    __truth_nonce: truthNonce,
    data: value
  }
  const genuineChamber = await buildSingleChamber(
    window.crypto.subtle,
    publicKey,
    clientSigningKeys,
    genuinePayload,
    serverKey.keyId,
    timestamp
  )

  // 2. 蜜罐诱饵密文舱：封入高仿真随机拟态数据（格式、长度、签名、IV均一致）
  const decoyEntropy = toBase64Url(window.crypto.getRandomValues(new Uint8Array(16)))
  const decoyPayload = {
    __xo_chamber: 'DECOY_HONEYPOT',
    __truth_nonce: `DECOY_${decoyEntropy}`,
    data: {
      syntheticToken: decoyEntropy,
      timestamp: Date.now(),
      decoyVector: toBase64Url(window.crypto.getRandomValues(new Uint8Array(32)))
    }
  }
  const decoyChamber = await buildSingleChamber(
    window.crypto.subtle,
    publicKey,
    clientSigningKeys,
    decoyPayload,
    serverKey.keyId,
    timestamp
  )

  // 3. 50% 几率随机混淆密文舱槽位排序，外部完全不可预知
  const isFirstChamberGenuine = (window.crypto.getRandomValues(new Uint8Array(1))[0] & 1) === 1
  const dualChambers: [ChamberEnvelope, ChamberEnvelope] = isFirstChamberGenuine
    ? [genuineChamber, decoyChamber]
    : [decoyChamber, genuineChamber]

  return {
    rsaHybrid: true,
    version: '1',
    algorithm: 'RSA-OAEP-256+AES-256-GCM+RSA-PSS-SHA256',
    keyId: serverKey.keyId,
    encryptedKey: genuineChamber.encryptedKey,
    iv: genuineChamber.iv,
    ciphertext: genuineChamber.ciphertext,
    authTag: genuineChamber.authTag,
    timestamp,
    clientPublicKey: genuineChamber.clientPublicKey,
    signature: genuineChamber.signature,
    digest: genuineChamber.digest,
    dualChambers,
    truthNonce
  }
}
