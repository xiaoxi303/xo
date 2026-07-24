/**
 * Get real client IP address, handling various proxy scenarios
 */
export function getRealClientIP(event: any): string {
  // Try X-Forwarded-For first (common proxy header)
  const xff = getRequestHeader(event, 'x-forwarded-for')
  if (xff) {
    // X-Forwarded-For can be "client, proxy1, proxy2" - take the first one
    const ip = xff.split(',')[0].trim()
    if (ip) return ip
  }
  
  // Try X-Real-IP (Nginx proxy)
  const xri = getRequestHeader(event, 'x-real-ip')
  if (xri) return xri.trim()
  
  // Try CF-Connecting-IP (Cloudflare)
  const cfip = getRequestHeader(event, 'cf-connecting-ip')
  if (cfip) return cfip.trim()
  
  // Try X-Client-IP
  const xci = getRequestHeader(event, 'x-client-ip')
  if (xci) return xci.trim()
  
  // Fallback to H3 getRequestIP
  const ip = getRequestIP(event, { xForwardedFor: true })
  if (ip) return ip
  
  // Last resort: socket remote address
  return event.node?.req?.socket?.remoteAddress || 'unknown'
}
