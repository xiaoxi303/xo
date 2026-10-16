/**
 * Get real client IP address, handling various proxy scenarios
 */
export function getRealClientIP(event: any): string {
  // Prioritize Cloudflare CF-Connecting-IP (set by edge proxy, tamper-proof)
  const cfip = getRequestHeader(event, 'cf-connecting-ip')
  if (cfip) return cfip.trim()

  // Try X-Real-IP (trusted reverse proxy / Nginx)
  const xri = getRequestHeader(event, 'x-real-ip')
  if (xri) return xri.trim()

  // Try X-Forwarded-For
  const xff = getRequestHeader(event, 'x-forwarded-for')
  if (xff) {
    const ip = xff.split(',')[0].trim()
    if (ip) return ip
  }
  
  // Try X-Client-IP
  const xci = getRequestHeader(event, 'x-client-ip')
  if (xci) return xci.trim()
  
  // Fallback to H3 getRequestIP
  const ip = getRequestIP(event, { xForwardedFor: true })
  if (ip) return ip
  
  // Last resort: socket remote address
  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

/**
 * Check if an IP is a local loopback, intranet private, or internal development address
 */
export function isLocalOrPrivateIP(ip: string): boolean {
  if (!ip) return true
  const clean = ip.trim().toLowerCase()
  if (
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean === 'localhost' ||
    clean === '::ffff:127.0.0.1' ||
    clean === 'unknown'
  ) {
    return true
  }
  // Local network ranges: 10.x.x.x, 192.168.x.x, 169.254.x.x
  if (clean.startsWith('10.') || clean.startsWith('192.168.') || clean.startsWith('169.254.')) {
    return true
  }
  // 172.16.x.x - 172.31.x.x
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) {
    return true
  }
  // IPv6 local / link-local / ULA
  if (clean.startsWith('fe80:') || clean.startsWith('fc00:') || clean.startsWith('fd00:')) {
    return true
  }
  return false
}
