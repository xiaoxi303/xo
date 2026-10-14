import { defineEventHandler, readBody, getRequestHeader, getRequestURL, createError } from 'h3'
import { decryptRsaHybrid, isRsaHybridPayload } from '../utils/vault-cipher'
import { getRealClientIP } from '../utils/ip-helper'
import { logSecurityEvent } from '../utils/security-logger'

// Excluded API routes that must remain unencrypted or handle external third-party protocols:
// 1. /api/security/rsa-public-key: Initial client key retrieval for hybrid encryption handshake
// 2. /api/upload: Multipart binary file upload
// 3. /api/admin/delivery-upload: Admin delivery binary file upload
// 4. /api/order/notify & /api/order/*/notify: Alipay asynchronous payment callback (signed via Alipay RSA2)
const EXCLUDED_PATHS = [
  /^\/api\/security\/rsa-public-key/i,
  /^\/api\/upload/i,
  /^\/api\/admin\/delivery-upload/i,
  /^\/api\/order\/.*notify/i,
  /^\/api\/order\/notify/i
]

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default defineEventHandler(async (event) => {
  const method = (event.method || 'GET').toUpperCase()
  if (!MUTATION_METHODS.has(method)) {
    return
  }

  const url = getRequestURL(event)
  const pathname = url.pathname.toLowerCase()

  // Only apply strict hybrid encryption enforcement to API endpoints
  if (!pathname.startsWith('/api/')) {
    return
  }

  // Check if route is explicitly exempted
  for (const pattern of EXCLUDED_PATHS) {
    if (pattern.test(pathname)) {
      return
    }
  }

  // Exclude native multipart/form-data requests
  const contentType = getRequestHeader(event, 'content-type') || ''
  if (contentType.toLowerCase().includes('multipart/form-data')) {
    return
  }

  // Exempt empty requests on endpoints that accept 0-byte signals (e.g. view heat count, logout)
  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (
    (pathname === '/api/auth/logout' || pathname === '/api/auth/client-logout' || pathname.endsWith('/view')) &&
    contentLength === 0
  ) {
    return
  }

  // Read request body
  let body: any = null
  try {
    body = await readBody(event)
  } catch (err: any) {
    // Empty or unparseable body will be caught below
  }

  // If body is an RSA-Hybrid encrypted payload, decrypt and unpack
  if (isRsaHybridPayload(body)) {
    try {
      const decryptedString = decryptRsaHybrid(body)
      const decryptedObj = JSON.parse(decryptedString)

      // Replace parsed body in h3 internal store so all downstream handlers calling readBody(event) receive the plain decrypted object
      event.node.req[Symbol.for('h3ParsedBody')] = decryptedObj
      event.context.hybridDecrypted = true
      event.context.decryptedBody = decryptedObj
      event.context.rawHybridPayload = body
      return
    } catch (decryptErr: any) {
      logSecurityEvent({
        type: 'Hybrid Decryption Failure',
        ip: getRealClientIP(event),
        action: `Failed to decrypt RSA Hybrid payload for ${method} ${pathname}: ${decryptErr?.message || 'Decryption error'}`,
        status: 'blocked'
      })
      throw createError({
        statusCode: 400,
        statusMessage: `RSA 混合加密解密失败: ${decryptErr?.message || '非法或损坏的密文'}`
      })
    }
  }

  // If a mutation request targeting an API endpoint is NOT hybrid encrypted, reject it immediately
  logSecurityEvent({
    type: 'Plaintext Mutation Intercepted',
    ip: getRealClientIP(event),
    action: `Blocked unencrypted plaintext ${method} request to ${pathname}`,
    status: 'blocked'
  })

  throw createError({
    statusCode: 400,
    statusMessage: '全链路强制要求使用 RSA 混合加密传输 (RSA-OAEP-256 + AES-256-GCM + RSA-PSS)，已拦截未加密的明文请求。'
  })
})
