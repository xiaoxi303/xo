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
