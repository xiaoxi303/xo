import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { dbGetSiteConfig, dbGetProjectsRaw } from '../utils/db'
import { assertDeliveryAccess, normalizeDeliverySlug } from '../utils/delivery-access'
import { fetchSafeUpstream } from '../utils/url-security'

// Server-side video stream processing endpoint
// When browser extensions, IDM, or users fetch/download the video,
// this endpoint streams the video with FFmpeg invisible watermark & site logo hardcoded directly into the video stream pixels.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetUrl = query.url as string

  if (!targetUrl) {
    throw createError({ statusCode: 400, message: 'Missing video url' })
  }

  // SSRF & Open-Proxy Prevention: Strictly validate target URL
  const isHttp = /^https?:\/\//i.test(targetUrl)
  if (isHttp) {
    let parsed: URL
    try {
      parsed = new URL(targetUrl)
    } catch {
      throw createError({ statusCode: 400, message: 'Invalid media URL format' })
    }

    // Allowed video hosting domains
    const ALLOWED_HOST_SUFFIXES = [
      '976896.xyz',
      'pexels.com',
      'mixkit.co',
      'vimeo.com',
      'xoxox.bond',
      'r2.cloudflarestorage.com'
    ]

    const host = parsed.hostname.toLowerCase()
    const isAllowedHost = ALLOWED_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith('.' + suffix))

    // Check if target matches any registered project or home video
    const projects = await dbGetProjectsRaw(event).catch(() => [])
    const target = String(targetUrl).trim()
    const ownerProject = Array.isArray(projects) ? projects.find((project: any) => {
      const urls = Array.isArray(project?.videoUrls)
        ? project.videoUrls
        : [project?.videoUrl]
      return urls.some((url: any) => String(url || '').trim() === target)
    }) : null

    const requestedSlug = normalizeDeliverySlug(query.slug)
    if (requestedSlug) {
      await assertDeliveryAccess(event, requestedSlug)
    } else if (ownerProject?.slug) {
      await assertDeliveryAccess(event, ownerProject.slug)
    }

    // If host is not in allowed domain whitelist AND not attached to any project, reject SSRF attempt
    if (!isAllowedHost && !ownerProject) {
      throw createError({
        statusCode: 403,
        message: '安全拦截：该媒体源未获授权或不在系统允许的分发列表中。'
      })
    }

    // Set response headers for video streaming
    setResponseHeader(event, 'Content-Type', 'video/mp4')
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')

    const range = getHeader(event, 'range')
    const upstream = await fetchSafeUpstream(targetUrl, {
      headers: range ? { range } : undefined,
    }).catch((err) => {
      console.warn('[video-stream] Upstream fetch failure:', err?.message || err)
      return null
    })

    if (!upstream || (!upstream.ok && upstream.status !== 206)) {
      throw createError({
        statusCode: upstream?.status || 502,
        message: '上游媒体服务暂不可用或视频已被归档，请稍后重试。'
      })
    }

    setResponseStatus(event, upstream.status)
    for (const name of ['content-type', 'content-length', 'content-range']) {
      const value = upstream.headers.get(name)
      if (value) setResponseHeader(event, name, value)
    }
    setResponseHeader(event, 'Accept-Ranges', 'bytes')
    return upstream.body
  }

  // Local file on server: strictly enforce path containment inside public directory
  if (!targetUrl.startsWith('/')) {
    throw createError({ statusCode: 400, message: 'Invalid video URL' })
  }

  const publicDir = path.resolve(process.cwd(), 'public')
  const normalized = path.normalize(targetUrl).replace(/^(\.\.[\/\\])+/, '')
  const resolvedPath = path.resolve(publicDir, '.' + normalized)
  if (!resolvedPath.startsWith(publicDir + path.sep) && resolvedPath !== publicDir) {
    throw createError({ statusCode: 403, message: 'Forbidden: Invalid video path' })
  }

  // Strictly enforce video extension
  const ext = path.extname(resolvedPath).toLowerCase()
  if (!['.mp4', '.webm', '.mov', '.m4v'].includes(ext)) {
    throw createError({ statusCode: 403, message: 'Forbidden: Only video files can be streamed' })
  }

  // Ensure file exists
  if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
    throw createError({ statusCode: 404, message: 'Video file not found' })
  }

  const inputPath = resolvedPath

  const siteConfig = await dbGetSiteConfig(event)
  const invisibleText = siteConfig?.watermark?.invisibleText || '© Xo Studio 2026'

  // Check if ffmpeg binary exists on server PATH
  try {
    const ffmpegArgs = [
      '-i', inputPath,
      '-vf', `drawtext=text='${invisibleText}':x=(w-tw)/2:y=(h-th)/2:fontsize=24:fontcolor=white@0.04:shadowcolor=black@0.02:shadowx=1:shadowy=1`,
      '-c:a', 'copy',
      '-f', 'mp4',
      '-movflags', 'frag_keyframe+empty_moov',
      'pipe:1'
    ]

    const ffmpegProc = spawn('ffmpeg', ffmpegArgs)

    ffmpegProc.stderr.on('data', () => {
      // Ignore ffmpeg stderr logs
    })

    return sendStream(event, ffmpegProc.stdout as any)
  } catch (err) {
    // Fallback if ffmpeg is not available on host
    if (fs.existsSync(inputPath)) {
      return sendStream(event, fs.createReadStream(inputPath) as any)
    }
    throw createError({ statusCode: 404, message: 'Video file not found' })
  }
})
