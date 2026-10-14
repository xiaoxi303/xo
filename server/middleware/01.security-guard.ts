import { getRequestHeader, setResponseHeader, removeResponseHeader, getRequestURL } from 'h3'
import { getRealClientIP } from '../utils/ip-helper'
import { logSecurityEvent } from '../utils/security-logger'

export default defineEventHandler((event) => {
  // 1. Scrub Framework and Server Identity Headers & Enforce HTTPS HSTS
  removeResponseHeader(event, 'x-powered-by')
  removeResponseHeader(event, 'x-nitro-version')
  setResponseHeader(event, 'Server', 'cloudflare-nginx')
  setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  setResponseHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin')
  setResponseHeader(event, 'Cross-Origin-Resource-Policy', 'same-origin')
  setResponseHeader(event, 'X-Permitted-Cross-Domain-Policies', 'none')

  const url = getRequestURL(event)
  const pathname = url.pathname.toLowerCase()
  const rawHost = getRequestHeader(event, 'host') || ''
  const hostWithoutPort = rawHost.split(':')[0].trim()

  // 2. Direct IP Cloaking & Origin Shielding:
  // When malicious scanners or crawler bots probe the server via raw IP (e.g. http://123.45.67.89/)
  // rather than the genuine domain, reject to prevent the origin server IP from being mapped.
  const isIpv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostWithoutPort)
  const isLocal = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1' || hostWithoutPort === '::1'

  if (isIpv4 && !isLocal && process.env.NODE_ENV === 'production') {
    const clientIp = getRealClientIP(event)
    logSecurityEvent({
      type: 'Origin IP Shield',
      ip: clientIp,
      action: `Blocked direct IP probe request (Host: ${rawHost})`,
      status: 'blocked'
    })
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Direct IP access prohibited.'
    })
  }

  // 3. Automated Vulnerability Scanner & Internal Build Artifacts Probing Filter
  // Immediately drop known probing paths and internal build artifacts (sql_dump.txt) without hitting application logic
  const BLOCKED_PROBE_PATTERNS = [
    /\/\.env/i,
    /\/\.git/i,
    /\/\.aws/i,
    /\/wp-(admin|login|content|includes)/i,
    /\/phpmyadmin/i,
    /\/actuator/i,
    /\/solr/i,
    /\/cgi-bin/i,
    /\/xmlrpc\.php/i,
    /\/__nuxt_content/i,
    /sql_dump\.txt/i
  ]

  for (const pattern of BLOCKED_PROBE_PATTERNS) {
    if (pattern.test(pathname)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })
    }
  }
})
