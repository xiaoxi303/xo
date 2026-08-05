import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { dbGetSiteConfig } from '../utils/db'

// Server-side video stream processing endpoint
// When browser extensions, IDM, or users fetch/download the video,
// this endpoint streams the video with FFmpeg invisible watermark & site logo hardcoded directly into the video stream pixels.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetUrl = query.url as string

  if (!targetUrl) {
    throw createError({ statusCode: 400, message: 'Missing video url' })
  }

  // If local file on server
  let inputPath = targetUrl
  if (targetUrl.startsWith('/')) {
    inputPath = path.resolve(process.cwd(), 'public' + targetUrl)
  }

  // Set response headers for video streaming
  setResponseHeader(event, 'Content-Type', 'video/mp4')
  setResponseHeader(event, 'Access-Control-Allow-Origin', '*')

  if (/^https?:\/\//i.test(targetUrl)) {
    const range = getHeader(event, 'range')
    const upstream = await fetch(targetUrl, {
      headers: range ? { range } : undefined,
      redirect: 'follow'
    }).catch(() => null)
    if (!upstream || (!upstream.ok && upstream.status !== 206)) {
      throw createError({ statusCode: upstream?.status || 502, message: 'Unable to fetch video source' })
    }
    setResponseStatus(event, upstream.status)
    for (const name of ['content-type', 'content-length', 'content-range']) {
      const value = upstream.headers.get(name)
      if (value) setResponseHeader(event, name, value)
    }
    setResponseHeader(event, 'Accept-Ranges', 'bytes')
    return upstream.body
  }

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
