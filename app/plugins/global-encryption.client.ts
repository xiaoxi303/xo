import { defineNuxtPlugin } from '#app'
import { encryptRsaHybrid, isRsaHybridPayload, getMachineFingerprint } from '~/utils/rsa-hybrid'
import { encryptVaultStorageSync, decryptVaultStorageSync, getOrCreateE2EEKey } from '~/utils/e2ee'

const BOOTSTRAP_STORAGE_KEYS = new Set([
  'xo_e2ee_master_key_v1',
  'xo_e2ee_ecdsa_pub_v6',
  'xo_e2ee_ecdsa_priv_v6',
  'xo_machine_fingerprint'
])

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  // 1. 预热自研 E2EE 量子主密钥与浏览器端双舱存储加密引擎
  if (typeof window !== 'undefined') {
    try {
      getMachineFingerprint()
      getOrCreateE2EEKey().catch(() => {})

      const installStorageVaultGuard = (storage: Storage) => {
        if (!storage || (storage as any).__xoVaultGuarded) return
        const rawGetItem = storage.getItem.bind(storage)
        const rawSetItem = storage.setItem.bind(storage)

        // 确保主密钥存在以支撑同步双舱加解密
        if (storage === window.localStorage && !rawGetItem('xo_e2ee_master_key_v1')) {
          const bytes = new Uint8Array(32)
          window.crypto.getRandomValues(bytes)
          const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
          rawSetItem('xo_e2ee_master_key_v1', hex)
        }

        storage.setItem = function (key: string, value: string) {
          if (BOOTSTRAP_STORAGE_KEYS.has(key)) {
            return rawSetItem(key, value)
          }
          const strVal = String(value ?? '')
          const sealed = strVal.startsWith('$XO_CLIENT_DUAL_CHAMBER_V5$')
            ? strVal
            : encryptVaultStorageSync(strVal, (k) => window.localStorage.getItem(k))
          return rawSetItem(key, sealed)
        }

        storage.getItem = function (key: string): string | null {
          const rawVal = rawGetItem(key)
          if (rawVal === null || BOOTSTRAP_STORAGE_KEYS.has(key)) {
            return rawVal
          }
          if (rawVal.startsWith('$XO_CLIENT_DUAL_CHAMBER_V5$')) {
            return decryptVaultStorageSync(rawVal, (k) => rawGetItem(k) || window.localStorage.getItem(k))
          }
          // 自动原地升舱：发现历史未加密存储项时，立刻无感升级为 V5 客户端双舱密文
          try {
            const upgraded = encryptVaultStorageSync(rawVal, (k) => rawGetItem(k) || window.localStorage.getItem(k))
            rawSetItem(key, upgraded)
          } catch {}
          return rawVal
        }

        // 启动时扫描并强制将所有存量明文键值升级为 $XO_CLIENT_DUAL_CHAMBER_V5$ 密文
        try {
          const keys: string[] = []
          for (let i = 0; i < storage.length; i++) {
            const k = storage.key(i)
            if (k && !BOOTSTRAP_STORAGE_KEYS.has(k)) keys.push(k)
          }
          for (const k of keys) {
            const v = rawGetItem(k)
            if (v && !v.startsWith('$XO_CLIENT_DUAL_CHAMBER_V5$')) {
              rawSetItem(k, encryptVaultStorageSync(v, (keyName) => rawGetItem(keyName)))
            }
          }
        } catch {}

        Object.defineProperty(storage, '__xoVaultGuarded', {
          value: true,
          enumerable: false,
          configurable: false
        })
      }

      if (window.localStorage) installStorageVaultGuard(window.localStorage)
      if (window.sessionStorage) installStorageVaultGuard(window.sessionStorage)
    } catch {}
  }

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

        const activeRouteSeal = typeof window !== 'undefined' ? ((window as any).__XO_ACTIVE_ROUTE_SEAL__ || '') : ''
        const activeRoutePath = typeof window !== 'undefined' ? ((window as any).__XO_ACTIVE_ROUTE_PATH__ || window.location.pathname || '/') : '/'

        if (urlStr.includes('/api/')) {
          finalOpts.headers = {
            ...(finalOpts.headers || {}),
            'x-machine-id': getMachineFingerprint(),
            'x-vault-protocol': 'XO_DUAL_CHAMBER_V5_HYBRID_V4',
            'x-quantum-e2ee': 'v6.0-P521-ZKP',
            'x-active-route': activeRoutePath,
            ...(activeRouteSeal ? { 'x-route-suffix-seal': activeRouteSeal.slice(0, 180) } : {})
          }
        }

        if (shouldEncrypt(urlStr, method, finalOpts.body)) {
          try {
            const serialized = await serializeBodyForEncryption(finalOpts.body)
            const encrypted = await encryptRsaHybrid(serialized !== undefined && serialized !== null ? serialized : {})
            finalOpts.body = encrypted
            finalOpts.headers = {
              ...(finalOpts.headers || {}),
              'Content-Type': 'application/json',
              'x-hybrid-encrypted': '1',
              'x-machine-id': getMachineFingerprint(),
              'x-vault-protocol': 'XO_DUAL_CHAMBER_V5_HYBRID_V4',
              'x-quantum-e2ee': 'v6.0-P521-ZKP',
              'x-active-route': activeRoutePath,
              ...(activeRouteSeal ? { 'x-route-suffix-seal': activeRouteSeal.slice(0, 180) } : {})
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

      if (urlStr.includes('/api/') && !shouldEncrypt(urlStr, method, finalInit.body)) {
        const headers = new Headers(finalInit.headers || (input instanceof Request ? input.headers : undefined))
        headers.set('x-machine-id', getMachineFingerprint())
        headers.set('x-vault-protocol', 'XO_DUAL_CHAMBER_V5_HYBRID_V4')
        headers.set('x-quantum-e2ee', 'v6.0-P521-ZKP')
        finalInit.headers = headers
      }

      let bodyToEncrypt = finalInit.body
      if (bodyToEncrypt === undefined && input instanceof Request) {
        try {
          const cloned = input.clone()
          const text = await cloned.text()
          if (text) {
            try { bodyToEncrypt = JSON.parse(text) } catch { bodyToEncrypt = text }
          }
        } catch {}
      }

      if (shouldEncrypt(urlStr, method, bodyToEncrypt)) {
        try {
          let rawBody = bodyToEncrypt
          if (typeof rawBody === 'string') {
            try { rawBody = JSON.parse(rawBody) } catch {}
          }
          const serialized = await serializeBodyForEncryption(rawBody)
          const encrypted = await encryptRsaHybrid(serialized !== undefined && serialized !== null ? serialized : {})
          const payloadStr = JSON.stringify(encrypted)

          if (input instanceof Request) {
            const nextHeaders = new Headers(input.headers)
            if (finalInit.headers) {
              new Headers(finalInit.headers).forEach((v, k) => nextHeaders.set(k, v))
            }
            nextHeaders.set('Content-Type', 'application/json')
            nextHeaders.set('x-hybrid-encrypted', '1')
            nextHeaders.set('x-machine-id', getMachineFingerprint())
            nextHeaders.set('x-vault-protocol', 'XO_DUAL_CHAMBER_V5_HYBRID_V4')
            nextHeaders.set('x-quantum-e2ee', 'v6.0-P521-ZKP')

            const nextReq = new Request(input.url, {
              method,
              headers: nextHeaders,
              body: payloadStr,
              credentials: input.credentials,
              mode: input.mode,
              cache: input.cache,
              redirect: input.redirect,
              referrer: input.referrer,
              integrity: input.integrity
            })
            return originalNativeFetch.call(window, nextReq)
          } else {
            finalInit.body = payloadStr
            const headers = new Headers(finalInit.headers || {})
            headers.set('Content-Type', 'application/json')
            headers.set('x-hybrid-encrypted', '1')
            headers.set('x-machine-id', getMachineFingerprint())
            headers.set('x-vault-protocol', 'XO_DUAL_CHAMBER_V5_HYBRID_V4')
            headers.set('x-quantum-e2ee', 'v6.0-P521-ZKP')
            finalInit.headers = headers
          }
        } catch (encryptionError) {
          console.error('[Security Guard] Native fetch encryption failed:', encryptionError)
          throw encryptionError
        }
      }

      return originalNativeFetch.call(window, input, finalInit)
    }
  }
})
