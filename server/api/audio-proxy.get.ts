// Audio proxy API — streams authorized external audio URL through same-origin so that
// Web Audio API's createMediaElementSource can do real frequency analysis without CORS errors.
// Usage: /api/audio-proxy?url=<encoded-url>
import { fetchSafeUpstream } from '../utils/url-security'
import { dbGetSiteConfig } from '../utils/db'

const ALLOWED_AUDIO_HOST_SUFFIXES = [
  'mixkit.co',
  'pexels.com',
  '976896.xyz',
  'xoxox.bond',
  'r2.cloudflarestorage.com',
  'pixabay.com',
  '126.net',
  'qq.com'
]

const SAFE_AUDIO_MIMES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/aac',
  'audio/flac',
  'application/octet-stream'
])

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetUrl = query.url as string

  if (!targetUrl) {
    throw createError({ statusCode: 400, message: 'Missing url parameter' })
  }

  let decodedUrl: string
  let parsedUrl: URL
  try {
    decodedUrl = decodeURIComponent(targetUrl).trim()
    parsedUrl = new URL(decodedUrl)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid url parameter' })
  }

  const host = parsedUrl.hostname.toLowerCase()
  const isWhitelistedHost = ALLOWED_AUDIO_HOST_SUFFIXES.some(
    suffix => host === suffix || host.endsWith('.' + suffix)
  )

  if (!isWhitelistedHost) {
    const siteConfig = await dbGetSiteConfig(event).catch(() => ({} as any))
    const configuredMusicUrl = String(siteConfig?.music?.url || '').trim()
    if (!configuredMusicUrl || configuredMusicUrl !== decodedUrl) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden: Audio source is not in the authorized media list'
      })
    }
  }

  try {
    const response = await fetchSafeUpstream(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AudioProxy/1.0)',
        'Accept': 'audio/*,*/*;q=0.9'
      }
    })

    if (!response.ok) {
      throw createError({ statusCode: response.status, message: `Upstream error: ${response.statusText}` })
    }

    // Strictly enforce safe audio MIME type to prevent Same-Origin XSS via text/html spoofing
    const rawContentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    const safeContentType = SAFE_AUDIO_MIMES.has(rawContentType) ? rawContentType : 'audio/mpeg'
    setResponseHeader(event, 'Content-Type', safeContentType)
    setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
    setResponseHeader(event, 'Content-Security-Policy', "default-src 'none'")
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

    // Stream the audio body directly
    return sendStream(event, response.body as any)
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, message: 'Failed to fetch audio from upstream' })
  }
})
