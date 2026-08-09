import crypto from 'node:crypto'

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

const MAX_CLOCK_SKEW_MS = 120 * 1000
const replayedPayloads = new Map<string, number>()
let generatedKeyPair: crypto.KeyPairKeyObjectResult | null = null

const decodeBase64Url = (value: string) => Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4), 'base64')

function getKeyPair() {
  if (generatedKeyPair) return generatedKeyPair
  const privateKey = process.env.RSA_PRIVATE_KEY
  const publicKey = process.env.RSA_PUBLIC_KEY
  if (privateKey && publicKey) {
    generatedKeyPair = {
      privateKey: crypto.createPrivateKey(privateKey.replace(/\\n/g, '\n')),
      publicKey: crypto.createPublicKey(publicKey.replace(/\\n/g, '\n'))
    }
    return generatedKeyPair
  }
  generatedKeyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048
  })
  return generatedKeyPair
}

function publicKeyPem() {
  return getKeyPair().publicKey.export({ type: 'spki', format: 'pem' }).toString()
}

function keyId() {
  const der = getKeyPair().publicKey.export({ type: 'spki', format: 'der' })
  return crypto.createHash('sha256').update(der).digest('hex').slice(0, 16).toUpperCase()
}

function canonicalPayload(payload: RsaHybridPayload) {
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

export function getRsaPublicKey() {
  return {
    publicKey: publicKeyPem(),
    keyId: keyId(),
    algorithm: 'RSA-OAEP-256+AES-256-GCM+RSA-PSS-SHA256'
  }
}

export function isRsaHybridPayload(value: any): value is RsaHybridPayload {
  return Boolean(
    value?.rsaHybrid === true &&
    value?.version === '1' &&
    value?.algorithm === 'RSA-OAEP-256+AES-256-GCM+RSA-PSS-SHA256' &&
    value?.keyId &&
    value?.encryptedKey &&
    value?.iv &&
    value?.ciphertext &&
    value?.authTag &&
    value?.timestamp &&
    value?.clientPublicKey &&
    value?.signature &&
    value?.digest
  )
}

export function decryptRsaHybrid(payload: RsaHybridPayload): string {
  if (payload.keyId !== keyId()) throw new Error('RSA 公钥版本不匹配')
  const timestamp = Date.parse(payload.timestamp)
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > MAX_CLOCK_SKEW_MS) {
    throw new Error('RSA 请求已过期')
  }
  const replayKey = `${payload.keyId}:${payload.timestamp}:${payload.digest}`
  if (replayedPayloads.has(replayKey)) throw new Error('RSA 请求重复提交')
  replayedPayloads.set(replayKey, Date.now())
  for (const [key, seenAt] of replayedPayloads) {
    if (Date.now() - seenAt > MAX_CLOCK_SKEW_MS) replayedPayloads.delete(key)
  }

  const clientPublicKey = crypto.createPublicKey({ key: payload.clientPublicKey as crypto.JsonWebKeyInput, format: 'jwk' })
  const verifier = crypto.createVerify('sha256')
  verifier.update(canonicalPayload(payload))
  verifier.end()
  if (!verifier.verify({ key: clientPublicKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 }, decodeBase64Url(payload.signature))) {
    throw new Error('RSA-PSS 签名验证失败')
  }

  const ciphertext = decodeBase64Url(payload.ciphertext)
  const expectedDigest = crypto.createHash('sha256').update(ciphertext).digest('base64url')
  if (expectedDigest !== payload.digest) throw new Error('密文摘要校验失败')

  const aesKey = crypto.privateDecrypt({
    key: getKeyPair().privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  }, decodeBase64Url(payload.encryptedKey))
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, decodeBase64Url(payload.iv))
  decipher.setAuthTag(decodeBase64Url(payload.authTag))
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

export function md5Fingerprint(value: string) {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase()
}
