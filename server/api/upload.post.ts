import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  // Read multipart form data
  const multipart = await readMultipartFormData(event)
  if (!multipart || multipart.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '没有上传任何文件。' })
  }

  // Find the file field (usually named "file")
  const file = multipart.find(item => item.name === 'file')
  if (!file || !file.filename || !file.data) {
    throw createError({ statusCode: 400, statusMessage: '无效的上传文件。' })
  }

  // Validate file type (images only)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']
  const fileType = file.type || ''
  if (!allowedTypes.includes(fileType)) {
    throw createError({ statusCode: 400, statusMessage: '只允许上传图片文件（jpeg, png, gif, webp, avif, svg）。' })
  }

  // File size limit (5MB)
  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: '图片大小请限制在 5MB 以内。' })
  }

  // Generate a safe unique name
  const ext = path.extname(file.filename) || '.jpg'
  const uniqueName = `${randomBytes(16).toString('hex')}${ext}`

  // Local uploads directory
  const uploadsDir = path.resolve(process.cwd(), 'public/uploads')
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    const filePath = path.join(uploadsDir, uniqueName)
    fs.writeFileSync(filePath, file.data)
    
    return { url: `/uploads/${uniqueName}` }
  } catch (err) {
    console.warn('Local filesystem is read-only. Falling back to inline base64 data URI:', err)
    
    // Fallback: convert file data to Base64 Data URI if disk writes encounter permission limits
    const base64 = file.data.toString('base64')
    return { url: `data:${fileType};base64,${base64}` }
  }
})
