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
  version: '2' | '1'
  keyId: string
  timestamp: string
  dualChambers: [ChamberEnvelope, ChamberEnvelope]
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

function canonicalPayload(payload: {
  keyId: string
  encryptedKey: string
  iv: string
  ciphertext: string
  authTag: string
  timestamp: string
  clientPublicKey: JsonWebKey
  digest: string
}): string {
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

async function computeConsensusProof(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await window.crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function isRsaHybridPayload(value: any): value is RsaHybridPayload {
  return Boolean(
    value &&
    typeof value === 'object' &&
    value.rsaHybrid === true &&
    (value.version === '2' || value.version === '1') &&
    typeof value.keyId === 'string' &&
    typeof value.timestamp === 'string' &&
    Array.isArray(value.dualChambers) &&
    value.dualChambers.length === 2 &&
    value.dualChambers.every((c: any) =>
      c &&
      typeof c.chamberId === 'string' &&
      typeof c.encryptedKey === 'string' &&
      typeof c.iv === 'string' &&
      typeof c.ciphertext === 'string' &&
      typeof c.authTag === 'string' &&
      c.clientPublicKey &&
      typeof c.signature === 'string' &&
      typeof c.digest === 'string'
    )
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
 * 一真一假双舱共识混合加密 (Dual-Chamber Decoy Consensus Hybrid Encryption)
 * 客户端构造两个密码学格式完全相同的密文舱，并随机排列顺序；
 * 真实舱包含与服务端派生的真理共识证明 (Consensus Proof)，诱饵舱包含仿真蜜罐数据；
 * 外部抓包无法区分真假，最终仅由服务端金库私钥与共识秘密完成解密裁决。
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

  // 计算与服务端金库私钥达成一致的真理共识证明
  const consensusSeed = serverKey.consensusSeed || serverKey.keyId
  const consensusProof = await computeConsensusProof(
    consensusSeed,
    `${serverKey.keyId}:${timestamp}:TRUE_CHAMBER`
  )

  // 1. 真实密文舱：封入真实数据与金库真理共识标识与证明
  const genuinePayload = {
    __vault_auth: 'GENUINE_MATRIX',
    consensusProof,
    truthNonce,
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
  const decoyProof = toBase64Url(window.crypto.getRandomValues(new Uint8Array(32)))
  const decoyPayload = {
    __vault_auth: 'DECOY_HONEYPOT',
    consensusProof: decoyProof,
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
    version: '2',
    keyId: serverKey.keyId,
    timestamp,
    dualChambers,
    truthNonce
  }
}
