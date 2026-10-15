import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { getCookie, readBody, readMultipartFormData, createError } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'

export default defineEventHandler(async event => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权' })

  let fileBuffer: Buffer | null = null
  let filename = ''
  let mime = ''

  // 1. 优先读取全链路双舱混合加密已解密载荷
  const body = event.context.decryptedBody || (await readBody(event).catch(() => null))
  if (body && body.base64Data) {
    filename = String(body.filename || 'delivery.mp4')
    mime = String(body.mimeType || 'video/mp4')
    fileBuffer = Buffer.from(body.base64Data, 'base64')
  } else {
    // 2. 备用读取 multipart 数据
    const parts = await readMultipartFormData(event).catch(() => null)
    const file = parts?.find(part => part.name === 'file' && part.data)
    if (file) {
      filename = String(file.filename || 'delivery.mp4')
      mime = String(file.type || 'video/mp4')
      fileBuffer = file.data
    }
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择视频文件或传输数据为空' })
  }

  if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(mime)) {
    throw createError({ statusCode: 400, statusMessage: '仅支持 MP4、WebM 或 MOV 视频' })
  }
  if (fileBuffer.length > 500 * 1024 * 1024) {
    throw createError({ statusCode: 413, statusMessage: '视频不能超过 500MB' })
  }

  const rawExt = path.extname(filename).toLowerCase()
  const allowedVideoExts = ['.mp4', '.webm', '.mov', '.m4v']
  const ext = allowedVideoExts.includes(rawExt) ? rawExt : (mime === 'video/webm' ? '.webm' : '.mp4')
  const dir = path.resolve(process.cwd(), 'public/uploads/delivery')
  fs.mkdirSync(dir, { recursive: true })
  const name = `${Date.now()}-${randomBytes(5).toString('hex')}${ext}`
  fs.writeFileSync(path.join(dir, name), fileBuffer)

  return { success: true, url: `/uploads/delivery/${name}` }
})
