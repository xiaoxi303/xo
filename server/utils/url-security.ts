import dns from 'node:dns/promises'
import net from 'node:net'

const MAX_REDIRECTS = 3

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number)
    return (
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 0
    )
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase()
    return (
      normalized === '::1' ||
      normalized === '::' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe8') ||
      normalized.startsWith('fe9') ||
      normalized.startsWith('fea') ||
      normalized.startsWith('feb')
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
