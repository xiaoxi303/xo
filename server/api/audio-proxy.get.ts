// Audio proxy API — streams any external audio URL through same-origin so that
// Web Audio API's createMediaElementSource can do real frequency analysis without CORS errors.
// Usage: /api/audio-proxy?url=<encoded-url>
import { fetchSafeUpstream } from '../utils/url-security'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetUrl = query.url as string

  if (!targetUrl) {
    throw createError({ statusCode: 400, message: 'Missing url parameter' })
  }

  let decodedUrl: string
  try {
    decodedUrl = decodeURIComponent(targetUrl)
    new URL(decodedUrl) // validate it's a real URL
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid url parameter' })
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

    // Forward content-type
    const contentType = response.headers.get('content-type') || 'audio/mpeg'
    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

    // Stream the audio body directly
    return sendStream(event, response.body as any)
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, message: 'Failed to fetch audio from upstream' })
  }
})
