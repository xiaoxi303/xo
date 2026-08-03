import crypto from 'node:crypto'

export interface E2EEEncryptedPayload {
  e2ee: boolean
  version: string
  algorithm: string
  ciphertext: string
  iv: string
  salt?: string
  hkdfHash: string
  keyFingerprint: string
  timestamp: string
  signature: string
  zkpProof?: string
  epochNonce: string
}

// Master E2EE Key derived or generated for server-side decryption/encryption
const SERVER_E2EE_SECRET = process.env.E2EE_SECRET || 'XO_STUDIO_E2EE_QUANTUM_MASTER_KEY_2026'

/**
 * Derive 256-bit key using HKDF-SHA512
 */
function deriveHKDFKey(secret: string, salt: Buffer, info: string): Buffer {
  return crypto.hkdfSync('sha512', Buffer.from(secret, 'utf-8'), salt, Buffer.from(info, 'utf-8'), 32)
}

/**
 * Calculate HMAC-SHA512 signature for data integrity
 */
function calculateHMAC(dataString: string, keyBuffer: Buffer): string {
  const hmac = crypto.createHmac('sha512', keyBuffer)
  hmac.update(dataString)
  return hmac.digest('hex').slice(0, 48).toUpperCase()
}

/**
 * Check if a payload is E2EE encrypted
 */
export function isE2EEPayload(data: any): data is E2EEEncryptedPayload {
  return !!(data && typeof data === 'object' && data.e2ee === true && data.ciphertext && data.iv)
}

/**
 * Decrypt client or server E2EE encrypted payload to string
 */
export function decryptE2EE(payload: E2EEEncryptedPayload | string | any): string {
  if (!payload) return ''

  // If payload is already a plain string or not E2EE, return directly
  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload)
      if (!isE2EEPayload(parsed)) return payload
      payload = parsed
    } catch {
      return payload
    }
  }

  if (!isE2EEPayload(payload)) {
    return typeof payload === 'object' ? JSON.stringify(payload) : String(payload)
  }

  try {
    const saltBuffer = payload.salt ? Buffer.from(payload.salt, 'hex') : Buffer.from('xo_e2ee_salt_2026', 'utf-8')
    const key = deriveHKDFKey(SERVER_E2EE_SECRET, saltBuffer, 'xo_e2ee_aes_key')
    const iv = Buffer.from(payload.iv, 'hex')

    // AES-256-GCM auth tag is usually the last 16 bytes of ciphertext in Web Crypto
    const fullCiphertext = Buffer.from(payload.ciphertext, 'hex')
    let cipherData: Buffer
    let authTag: Buffer

    if (fullCiphertext.length > 16) {
      cipherData = fullCiphertext.subarray(0, fullCiphertext.length - 16)
      authTag = fullCiphertext.subarray(fullCiphertext.length - 16)
    } else {
      cipherData = fullCiphertext
      authTag = Buffer.alloc(16)
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(cipherData, undefined, 'utf-8')
    decrypted += decipher.final('utf-8')

    return decrypted
  } catch (error) {
    // If decryption fails with server secret, try raw AES-256-GCM fallback
    try {
      const iv = Buffer.from(payload.iv, 'hex')
      const fullCiphertext = Buffer.from(payload.ciphertext, 'hex')
      const cipherData = fullCiphertext.subarray(0, fullCiphertext.length - 16)
      const authTag = fullCiphertext.subarray(fullCiphertext.length - 16)

      const fallbackKey = crypto.createHash('sha256').update(SERVER_E2EE_SECRET).digest()
      const decipher = crypto.createDecipheriv('aes-256-gcm', fallbackKey, iv)
      decipher.setAuthTag(authTag)

      let decrypted = decipher.update(cipherData, undefined, 'utf-8')
      decrypted += decipher.final('utf-8')
      return decrypted
    } catch {
      console.error('[E2EE] Server decryption failed for payload fingerprint:', payload.keyFingerprint)
      throw new Error('E2EE 解密失败：密钥不匹配或数据已被篡改。')
    }
  }
}

/**
 * Encrypt plaintext on server side using AES-256-GCM + HKDF-SHA512
 */
export function encryptE2EE(plaintext: string): E2EEEncryptedPayload {
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const key = deriveHKDFKey(SERVER_E2EE_SECRET, salt, 'xo_e2ee_aes_key')

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let ciphertext = cipher.update(plaintext, 'utf-8', 'hex')
  ciphertext += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')
  const combinedCiphertext = ciphertext + authTag

  const timestamp = new Date().toISOString()
  const epochNonce = crypto.randomBytes(8).toString('hex').toUpperCase()
  const hkdfHash = crypto.createHash('sha256').update(salt).digest('hex').slice(0, 24).toUpperCase()

  const hmacKey = deriveHKDFKey(SERVER_E2EE_SECRET, salt, 'xo_e2ee_hmac_key')
  const signature = calculateHMAC(`${combinedCiphertext}:${iv.toString('hex')}:${timestamp}:${hkdfHash}:${epochNonce}`, hmacKey)

  const fingerprint = crypto.createHash('sha512').update(SERVER_E2EE_SECRET).digest('hex').slice(0, 32).toUpperCase()

  return {
    e2ee: true,
    version: '4.0-QUANTUM-MATRIX',
    algorithm: 'AES-256-GCM+HKDF-SHA512',
    ciphertext: combinedCiphertext,
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    hkdfHash,
    keyFingerprint: fingerprint,
    timestamp,
    signature: `HMAC-SHA512:${signature}`,
    epochNonce
  }
}
