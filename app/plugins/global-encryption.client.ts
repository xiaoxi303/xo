import { defineNuxtPlugin } from '#app'
import { encryptRsaHybrid, isRsaHybridPayload, getMachineFingerprint } from '~/utils/rsa-hybrid'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const originalFetch = globalThis.$fetch
  if (!originalFetch) return

  // 全链路强约束：零豁免路由，所有发往 /api/ 的增删改变更请求必须经过金库双舱混合加密
  const shouldEncrypt = (url: string, method: string, body: any): boolean => {
    const normMethod = (method || 'GET').toUpperCase()
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(normMethod)) {
      return false
    }

    if (!url.includes('/api/')) {
      return false
    }

    // 幂等防护：若已是双舱加密密文，无需重复封装
    if (isRsaHybridPayload(body)) {
      return false
    }

    return true
  }

  // 将二进制 FormData 自动无感转换为双舱加密的抗嗅探密文载荷
  const serializeBodyForEncryption = async (body: any): Promise<any> => {
    if (body === undefined || body === null) return {}
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      const result: Record<string, any> = {}
      for (const [key, value] of (body as any).entries()) {
        if (typeof Blob !== 'undefined' && value instanceof Blob) {
          const buffer = await value.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          let binary = ''
          const chunk = 8192
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)))
          }
          const base64 = btoa(binary)
          const fileMeta = {
            filename: typeof File !== 'undefined' && value instanceof File ? value.name : 'upload.bin',
            mimeType: value.type || 'application/octet-stream',
            base64Data: base64
          }
          result[key] = fileMeta
          if (key === 'file') {
            result.filename = fileMeta.filename
            result.mimeType = fileMeta.mimeType
            result.base64Data = fileMeta.base64Data
          }
        } else {
          result[key] = value
        }
      }
      return result
    }
    return body
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
            const serialized = await serializeBodyForEncryption(finalOpts.body)
            const encrypted = await encryptRsaHybrid(serialized !== undefined && serialized !== null ? serialized : {})
            finalOpts.body = encrypted
            finalOpts.headers = {
              ...(finalOpts.headers || {}),
              'Content-Type': 'application/json',
              'x-hybrid-encrypted': '1',
              'x-machine-id': getMachineFingerprint()
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

  // Hook native window.fetch to ensure any third-party or native fetch calls are also protected
  if (typeof window !== 'undefined' && window.fetch) {
    const originalNativeFetch = window.fetch
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      let finalInit = init ? { ...init } : {}
      const urlStr = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString())
      const method = (finalInit.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()

      if (shouldEncrypt(urlStr, method, finalInit.body)) {
        try {
          let rawBody = finalInit.body
          if (typeof rawBody === 'string') {
            try { rawBody = JSON.parse(rawBody) } catch {}
          }
          const serialized = await serializeBodyForEncryption(rawBody)
          const encrypted = await encryptRsaHybrid(serialized !== undefined && serialized !== null ? serialized : {})
          finalInit.body = JSON.stringify(encrypted)
          const headers = new Headers(finalInit.headers || (input instanceof Request ? input.headers : {}))
          headers.set('Content-Type', 'application/json')
          headers.set('x-hybrid-encrypted', '1')
          headers.set('x-machine-id', getMachineFingerprint())
          finalInit.headers = headers
        } catch (encryptionError) {
          console.error('[Security Guard] Native fetch encryption failed:', encryptionError)
          throw encryptionError
        }
      }

      return originalNativeFetch.call(window, input, finalInit)
    }
  }
})
