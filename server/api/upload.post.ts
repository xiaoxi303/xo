import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'crypto'
import { getCookie, readBody, readMultipartFormData, createError } from 'h3'
import { validateSession, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的上传请求，请先登录管理员账户。' })
  }

  let fileBuffer: Buffer | null = null
  let filename = ''
  let fileType = ''

  // 1. 优先读取全链路双舱混合加密已解密载荷 (event.context.decryptedBody 或 readBody)
  const body = event.context.decryptedBody || (await readBody(event).catch(() => null))
  if (body && body.base64Data) {
    filename = String(body.filename || 'upload.png')
    fileType = String(body.mimeType || 'image/png')
    fileBuffer = Buffer.from(body.base64Data, 'base64')
  } else {
    // 2. 备用读取已验签 multipart 数据
    const multipart = await readMultipartFormData(event).catch(() => null)
    if (multipart && multipart.length > 0) {
      const file = multipart.find(item => item.name === 'file')
      if (file && file.filename && file.data) {
        filename = file.filename
        fileType = file.type || ''
        fileBuffer = file.data
      }
    }
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '没有上传任何文件或数据载荷为空。' })
  }

  // Validate file type (images only)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  if (!allowedTypes.includes(fileType)) {
    throw createError({ statusCode: 400, statusMessage: '只允许上传图片文件（jpeg, png, gif, webp, avif）。' })
  }

  // Validate binary magic bytes to prevent MIME spoofing / Polyglot uploads
  const isMagicValid = (buf: Buffer): boolean => {
    if (!buf || buf.length < 12) return false
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true // JPEG
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true // PNG
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true // GIF
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return true // WebP
    if (buf.toString('ascii', 4, 8) === 'ftyp') return true // AVIF / HEIF
    return false
  }
  if (!isMagicValid(fileBuffer)) {
    throw createError({ statusCode: 400, statusMessage: '上传的文件二进制签名与图片格式不匹配，拒绝写入。' })
  }

  // File size limit (5MB)
  if (fileBuffer.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: '图片大小请限制在 5MB 以内。' })
  }

  // Generate a safe unique name with whitelisted extension
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/avif': '.avif'
  }
  const rawExt = path.extname(filename || '').toLowerCase()
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']
  const safeExt = allowedExts.includes(rawExt) ? rawExt : (mimeToExt[fileType] || '.jpg')
  const uniqueName = `${randomBytes(16).toString('hex')}${safeExt}`

  // Local uploads directory
  const uploadsDir = path.resolve(process.cwd(), 'public/uploads')

  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    const filePath = path.join(uploadsDir, uniqueName)
    fs.writeFileSync(filePath, fileBuffer)

    return { url: `/uploads/${uniqueName}` }
  } catch (err) {
    // Fallback: convert file data to Base64 Data URI if disk writes encounter permission limits
    const base64 = fileBuffer.toString('base64')
    return { url: `data:${fileType};base64,${base64}` }
  }
})
