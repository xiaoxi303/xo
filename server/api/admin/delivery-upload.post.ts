import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { getCookie, readMultipartFormData } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'

export default defineEventHandler(async event => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权' })
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file' && part.data)
  if (!file) throw createError({ statusCode: 400, statusMessage: '请选择视频文件' })
  const mime = String(file.type || '')
  if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(mime)) throw createError({ statusCode: 400, statusMessage: '仅支持 MP4、WebM 或 MOV 视频' })
  if (file.data.length > 500 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: '视频不能超过 500MB' })
  const ext = path.extname(String(file.filename || '')).toLowerCase() || (mime === 'video/webm' ? '.webm' : '.mp4')
  const dir = path.resolve(process.cwd(), 'public/uploads/delivery')
  fs.mkdirSync(dir, { recursive: true })
  const name = `${Date.now()}-${randomBytes(5).toString('hex')}${ext}`
  fs.writeFileSync(path.join(dir, name), file.data)
  return { success: true, url: `/uploads/delivery/${name}` }
})
