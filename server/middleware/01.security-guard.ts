import { getRequestHeader, setResponseHeader, removeResponseHeader, getRequestURL, getHeader, sendRedirect, createError } from 'h3'
import { getRealClientIP } from '../utils/ip-helper'
import { logSecurityEvent } from '../utils/security-logger'
import { checkRateLimit } from '../utils/rate-limiter'
import { triggerIntruderLockout } from '../utils/vault-cipher'

export default defineEventHandler(async (event) => {
  // 1. Scrub Framework and Server Identity Headers & Enforce Strict Airtight Security Headers
  removeResponseHeader(event, 'x-powered-by')
  removeResponseHeader(event, 'x-nitro-version')
  setResponseHeader(event, 'Server', 'cloudflare-nginx')
  const rawHost = getRequestHeader(event, 'host') || ''
  const isLocalHost = rawHost.includes('localhost') || rawHost.includes('127.0.0.1') || rawHost.includes('::1')
  if (!isLocalHost && process.env.NODE_ENV === 'production') {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  setResponseHeader(event, 'Cross-Origin-Resource-Policy', 'same-origin')
  setResponseHeader(event, 'X-Permitted-Cross-Domain-Policies', 'none')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  setResponseHeader(event, 'X-XSS-Protection', '1; mode=block')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  const clientIp = getRealClientIP(event)
  const machineId = getRequestHeader(event, 'x-machine-id') || ''

  // 2. Active Defense: IP and Machine Lockout Enforcement
  const ipLock = checkRateLimit(clientIp)
  if (ipLock.isLocked) {
    throw createError({
      statusCode: 403,
      statusMessage: `安全防御系统已触发：当前终端存在恶意探测攻击记录，已被安全封锁。`
    })
  }

  if (machineId) {
    const machLock = checkRateLimit(`mach:${machineId}`)
    if (machLock.isLocked) {
      throw createError({
        statusCode: 403,
        statusMessage: `安全防御系统已触发：该设备机器码已被锁定。`
      })
    }
  }

  const url = getRequestURL(event)
  const pathname = url.pathname.toLowerCase()
  const hostWithoutPort = rawHost.split(':')[0].trim()

  // Enforce HTTPS: Force all plain HTTP traffic to HTTPS via 301 permanent redirect
  const proto = getRequestHeader(event, 'x-forwarded-proto')
  if (proto === 'http' && process.env.NODE_ENV === 'production') {
    const targetHost = rawHost || 'xo.xoxox.bond'
    return sendRedirect(event, `https://${targetHost}${url.pathname}${url.search}`, 301)
  }

  // 3. Direct IP Cloaking & Origin Shielding:
  // When malicious scanners or crawler bots probe the server via raw IP (e.g. http://123.45.67.89/)
  // rather than the genuine domain, reject to prevent the origin server IP from being mapped.
  const isIpv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostWithoutPort)
  const isLocal = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1' || hostWithoutPort === '::1'

  if (isIpv4 && !isLocal && process.env.NODE_ENV === 'production') {
    await triggerIntruderLockout(event, `直接裸IP探测扫描 (Host: ${rawHost})`)
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Direct IP access prohibited.'
    })
  }

  // Allow internal Nitro prerendering engine during build phase
  if (getHeader(event, 'x-nitro-prerender')) {
    return
  }

  // 4. Automated Vulnerability Scanner & Sensitive Resource Probing Filter
  // Probing sensitive paths immediately locks out the attacker's IP and machine code
  const BLOCKED_PROBE_PATTERNS = [
    /\/\.env/i,
    /\/\.git/i,
    /\/\.aws/i,
    /\/\.ssh/i,
    /\/\.vscode/i,
    /\/\.idea/i,
    /\/\.ds_store/i,
    /\/wp-(admin|login|content|includes)/i,
    /\/phpmyadmin/i,
    /\/adminer/i,
    /\/actuator/i,
    /\/solr/i,
    /\/cgi-bin/i,
    /\/xmlrpc\.php/i,
    /\/__nuxt_content/i,
    /\/sql_dump/i,
    /\/schema_dump/i,
    /\/content\//i,
    /\/package(-lock)?\.json/i,
    /\/tsconfig\.json/i,
    /\/ecosystem\.config\.cjs/i,
    /\/docker-compose/i,
    /\/server/i,
    /\/\.output/i,
    /\/vault/i,
    /\/cipher/i,
    /\/utils\//i,
    /\/plugins\//i,
    /\/middleware\//i,
    /\/node_modules/i,
    /\/scripts\//i,
    /\/deploy\//i,
    /\.(ts|vue|mjs|cjs|jsx|tsx|map)$/i,
    /\.(key|pem|crt|cer|pfx|p12|csr)$/i,
    /\.(sh|bash|ps1|bat|cmd|py|rb|pl)$/i,
    /\.(conf|config|ini|yaml|yml)$/i,
    /\.(sql|db|sqlite|sqlite3|dump|bak|backup|old|orig|save|swp|tar|gz|zip)$/i
  ]

  for (const pattern of BLOCKED_PROBE_PATTERNS) {
    if (pattern.test(pathname)) {
      await triggerIntruderLockout(event, `探测敏感系统文件/扫描漏洞路径: ${pathname}`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })
    }
  }
})
