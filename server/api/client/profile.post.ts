import {
  validateSession,
  CLIENT_SESSION_COOKIE,
  SESSION_COOKIE_OPTS,
  hashPassword,
  verifyPassword,
  destroyAllUserSessions,
  createSession
} from '../../utils/auth'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from '../../utils/storage'

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
  const { email, password, currentPassword, avatar, nickname, wechat } = body || {}

  // Validate at least one contact method is provided
  if (email !== undefined && wechat !== undefined && !email.trim() && !wechat.trim()) {
    throw createError({ statusCode: 400, statusMessage: '邮箱和微信号必须选择填写一项。' })
  }

  const usersPath = getRuntimeDataPath('users.json')
  const users = readEncryptedJson<any[]>(usersPath, [])
  if (!users || users.length === 0) {
    throw createError({ statusCode: 404, statusMessage: '用户数据文件不存在或为空。' })
  }

  try {
    const idx = users.findIndex((u: any) => u.username === username)
    if (idx === -1) {
      throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
    }

    // Update fields with duplicate email check
    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase()
      if (cleanEmail && cleanEmail !== (users[idx].email || '').trim().toLowerCase()) {
        const emailTaken = users.some((u: any, i: number) => i !== idx && u.email && u.email.trim().toLowerCase() === cleanEmail)
        if (emailTaken) {
          throw createError({ statusCode: 409, statusMessage: '该邮箱已被其他账号使用，请更换邮箱。' })
        }
      }
      users[idx].email = email.trim()
    }
    if (wechat !== undefined) users[idx].wechat = wechat
    if (avatar !== undefined) users[idx].avatar = avatar
    if (nickname !== undefined) users[idx].nickname = nickname
    
    if (password) {
      if (password.trim().length < 6) {
        throw createError({ statusCode: 400, statusMessage: '新密码长度至少为 6 位。' })
      }
      const rawCurrent = String(currentPassword || '').trim()
      if (!rawCurrent) {
        throw createError({ statusCode: 400, statusMessage: '修改密码需要输入当前原密码进行安全确认。' })
      }
      if (!verifyPassword(rawCurrent, users[idx].password)) {
        throw createError({ statusCode: 401, statusMessage: '当前原密码不正确，安全验证未通过。' })
      }
      users[idx].password = hashPassword(password)
      // Revoke all existing sessions across devices
      destroyAllUserSessions(username)
      // Re-issue a fresh token for current connection
      const freshToken = createSession(username)
      setCookie(event, CLIENT_SESSION_COOKIE, freshToken, SESSION_COOKIE_OPTS)
    }

    writeEncryptedJson(usersPath, users)
    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '更新个人资料失败，请稍后重试。'
    })
  }
})
