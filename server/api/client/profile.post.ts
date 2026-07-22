import { validateSession, CLIENT_SESSION_COOKIE, hashPassword } from '../../utils/auth'
import { getRuntimeDataPath } from '../../utils/storage'
import fs from 'node:fs'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录客户账号。' })
  }

  const session = validateSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })
  }

  const username = session.username
  const body = await readBody(event)
  const { email, password, avatar, nickname, wechat } = body || {}

  // Validate at least one contact method is provided
  if (email !== undefined && wechat !== undefined && !email.trim() && !wechat.trim()) {
    throw createError({ statusCode: 400, statusMessage: '邮箱和微信号必须选择填写一项。' })
  }

  const usersPath = getRuntimeDataPath('users.json')
  if (!fs.existsSync(usersPath)) {
    throw createError({ statusCode: 404, statusMessage: '用户数据文件不存在。' })
  }

  try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    const idx = users.findIndex((u: any) => u.username === username)
    if (idx === -1) {
      throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
    }

    // Update fields
    if (email !== undefined) users[idx].email = email
    if (wechat !== undefined) users[idx].wechat = wechat
    if (avatar !== undefined) users[idx].avatar = avatar
    if (nickname !== undefined) users[idx].nickname = nickname
    
    if (password) {
      if (password.trim().length < 6) {
        throw createError({ statusCode: 400, statusMessage: '新密码长度至少为 6 位。' })
      }
      users[idx].password = hashPassword(password)
    }

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8')
    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '更新个人资料失败，请稍后重试。'
    })
  }
})
