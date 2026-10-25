import dns from 'node:dns/promises'
import net from 'node:net'

const MAX_REDIRECTS = 3

function isPrivateIp(address: string): boolean {
  const cleanAddr = address.trim().toLowerCase()

  // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (cleanAddr.startsWith('::ffff:')) {
    const mappedPart = cleanAddr.slice(7)
    if (net.isIPv4(mappedPart)) {
      return isPrivateIp(mappedPart)
    }
    const hexMatch = mappedPart.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
    if (hexMatch) {
      const hi = parseInt(hexMatch[1], 16)
      const lo = parseInt(hexMatch[2], 16)
      const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`
      return isPrivateIp(ipv4)
    }
    return true
  }

  if (net.isIPv4(cleanAddr)) {
    const [a, b] = cleanAddr.split('.').map(Number)
    return (
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // RFC 6598 Carrier-Grade NAT
      (a === 169 && b === 254) ||           // Link-local / Cloud metadata
      (a === 172 && b >= 16 && b <= 31) ||  // RFC 1918 private
      (a === 192 && b === 168) ||           // RFC 1918 private
      a === 0 ||
      a >= 224                              // Multicast & reserved
    )
  }

  if (net.isIPv6(cleanAddr)) {
    return (
      cleanAddr === '::1' ||
      cleanAddr === '0:0:0:0:0:0:0:1' ||
      cleanAddr === '::' ||
      cleanAddr === '0:0:0:0:0:0:0:0' ||
      cleanAddr.startsWith('fc') ||
      cleanAddr.startsWith('fd') ||
      cleanAddr.startsWith('fe8') ||
      cleanAddr.startsWith('fe9') ||
      cleanAddr.startsWith('fea') ||
      cleanAddr.startsWith('feb')
    )
  }

  return true
}

export async function assertSafeUpstreamUrl(input: string): Promise<URL> {
  const url = new URL(input)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw createError({ statusCode: 403, statusMessage: 'Only HTTP(S) upstream URLs are allowed' })
  }
  if (url.username || url.password) {
    throw createError({ statusCode: 403, statusMessage: 'Upstream credentials are not allowed' })
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '')
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname === 'metadata.google.internal' ||
    hostname === '169.254.169.254'
  ) {
    throw createError({ statusCode: 403, statusMessage: 'Private upstream hosts are not allowed' })
  }

  // Always resolve and validate target IP fresh on every call to prevent DNS Rebinding attacks
  const addresses = net.isIP(hostname)
    ? [hostname]
    : (await dns.lookup(hostname, { all: true })).map(entry => entry.address)
  if (!addresses.length || addresses.some(isPrivateIp)) {
    throw createError({ statusCode: 403, statusMessage: 'Private upstream hosts are not allowed' })
  }

  return url
}

export async function fetchSafeUpstream(input: string, init: RequestInit = {}) {
  let current = input
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const url = await assertSafeUpstreamUrl(current)
    const response = await fetch(url, { ...init, redirect: 'manual' })
    if (![301, 302, 303, 307, 308].includes(response.status)) return response

    const location = response.headers.get('location')
    if (!location || redirects === MAX_REDIRECTS) {
      throw createError({ statusCode: 502, statusMessage: 'Too many upstream redirects' })
    }
    current = new URL(location, url).toString()
  }
  throw createError({ statusCode: 502, statusMessage: 'Unable to fetch upstream resource' })
}
