interface SecureSessionState {
  ready: boolean
  algorithm: string
  fingerprint: string
  error: string
}

const sessionKey = useState<SecureSessionState>('xo_secure_session', () => ({
  ready: false,
  algorithm: 'ECDH P-384',
  fingerprint: '',
  error: ''
}))

let keyPair: CryptoKeyPair | null = null
let initPromise: Promise<void> | null = null

const toBase64Url = (value: ArrayBuffer) => {
  let binary = ''
  for (const byte of new Uint8Array(value)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const shortFingerprint = async (publicKey: CryptoKey) => {
  const jwk = await crypto.subtle.exportKey('jwk', publicKey)
  const serialized = new TextEncoder().encode(JSON.stringify({
    crv: jwk.crv,
    kty: jwk.kty,
    x: jwk.x,
    y: jwk.y
  }))
  const digest = await crypto.subtle.digest('SHA-256', serialized)
  return toBase64Url(digest).slice(0, 12).toUpperCase()
}

export const useSecureSession = () => {
  const init = async () => {
    if (sessionKey.value.ready || initPromise) return initPromise
    initPromise = (async () => {
      if (!import.meta.client || !window.crypto?.subtle) {
        sessionKey.value.error = 'Web Crypto unavailable'
        return
      }

      try {
        keyPair = await window.crypto.subtle.generateKey(
          { name: 'ECDH', namedCurve: 'P-384' },
          false,
          ['deriveKey', 'deriveBits']
        )
        sessionKey.value.fingerprint = await shortFingerprint(keyPair.publicKey)
        sessionKey.value.ready = true
      } catch (error: any) {
        sessionKey.value.error = error?.message || 'Secure session unavailable'
      }
    })()

    await initPromise
    return initPromise
  }

  return {
    session: readonly(sessionKey),
    init,
    publicKey: computed(() => keyPair?.publicKey || null)
  }
}
