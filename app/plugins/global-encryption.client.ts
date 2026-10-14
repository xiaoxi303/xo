import { defineNuxtPlugin } from '#app'
import { encryptRsaHybrid, isRsaHybridPayload } from '~/utils/rsa-hybrid'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const originalFetch = globalThis.$fetch
  if (!originalFetch) return

  // Endpoints that are explicitly excluded from mandatory JSON hybrid encryption:
  // 1. RSA public key exchange endpoint (required for initial cryptographic handshake)
  // 2. Binary multi-part file uploads (streamed via FormData)
  // 3. Alipay / third-party asynchronous payment callback webhooks
  const EXCLUDED_URL_PATTERNS = [
    /\/api\/security\/rsa-public-key/i,
    /\/api\/upload/i,
    /\/api\/admin\/delivery-upload/i,
    /\/api\/order\/.*notify/i
  ]

  const isExcluded = (url: string): boolean => {
    return EXCLUDED_URL_PATTERNS.some((pattern) => pattern.test(url))
  }

  const shouldEncrypt = (url: string, method: string, body: any): boolean => {
    const normMethod = (method || 'GET').toUpperCase()
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(normMethod)) {
      return false
    }

    if (!url.includes('/api/')) {
      return false
    }

    if (isExcluded(url)) {
      return false
    }

    // Do not encrypt native binary forms or raw buffers
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      return false
    }
    if (typeof Blob !== 'undefined' && body instanceof Blob) {
      return false
    }
    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
      return false
    }

    // Idempotency: skip if already an RSA-Hybrid encrypted payload
    if (isRsaHybridPayload(body)) {
      return false
    }

    return true
  }

  const wrappedFetch = new Proxy(originalFetch, {
    apply(target, thisArg, args) {
      const [request, opts] = args

      return (async () => {
        let finalOpts = opts ? { ...opts } : {}
        const urlStr = typeof request === 'string' ? request : (request?.url || '')
        const method = (finalOpts.method || (typeof request === 'object' ? request?.method : 'GET')).toUpperCase()

        if (shouldEncrypt(urlStr, method, finalOpts.body)) {
          try {
            const payloadToEncrypt = finalOpts.body !== undefined && finalOpts.body !== null ? finalOpts.body : {}
            const encrypted = await encryptRsaHybrid(payloadToEncrypt)
            finalOpts.body = encrypted
            finalOpts.headers = {
              ...(finalOpts.headers || {}),
              'Content-Type': 'application/json',
              'x-hybrid-encrypted': '1'
            }
          } catch (encryptionError) {
            console.error('[Security Guard] Global hybrid encryption failed:', encryptionError)
            throw encryptionError
          }
        }

        return Reflect.apply(target, thisArg, [request, finalOpts])
      })()
    }
  })

  // Set wrapped fetch globally and in NuxtApp context
  globalThis.$fetch = wrappedFetch as any
  nuxtApp.$fetch = wrappedFetch as any
  nuxtApp.provide('fetch', wrappedFetch)
})
