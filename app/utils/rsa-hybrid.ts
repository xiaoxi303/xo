export interface RsaPublicKeyResponse {
  publicKey: string
  keyId: string
  algorithm: string
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

async function getServerPublicKey(): Promise<RsaPublicKeyResponse> {
  return await $fetch<RsaPublicKeyResponse>('/api/security/rsa-public-key')
}

export async function encryptRsaHybrid(value: unknown): Promise<RsaHybridPayload> {
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
  const aesKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey)
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey
  )

  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encrypted = new Uint8Array(await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    aesKey,
    textEncoder.encode(JSON.stringify(value))
  ))
  const ciphertext = encrypted.slice(0, -16)
  const authTag = encrypted.slice(-16)
  const timestamp = new Date().toISOString()
  const clientPublicKey = await window.crypto.subtle.exportKey('jwk', clientSigningKeys.publicKey)
  const digest = toBase64Url(await window.crypto.subtle.digest('SHA-256', ciphertext))
  const unsigned = {
    keyId: serverKey.keyId,
    encryptedKey: toBase64Url(encryptedKey),
    iv: toBase64Url(iv),
    ciphertext: toBase64Url(ciphertext),
    authTag: toBase64Url(authTag),
    timestamp,
    clientPublicKey,
    digest
  }
  const signature = await window.crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    clientSigningKeys.privateKey,
    textEncoder.encode(canonicalPayload(unsigned))
  )

  return {
    rsaHybrid: true,
    version: '1',
    algorithm: 'RSA-OAEP-256+AES-256-GCM+RSA-PSS-SHA256',
    ...unsigned,
    signature: toBase64Url(signature)
  }
}
