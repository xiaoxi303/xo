import { dbUpdateUser } from '../../utils/db'
import { hashPassword, validateSession, SESSION_COOKIE } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const body = await readBody(event)
  const { id, email, role, allowedProjects, password, wechat } = body || {}

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少用户 ID。'
    })
  }

  const updateData: any = {
    email: email ? email.trim() : '',
    wechat: wechat ? wechat.trim() : '',
    role: role || 'client',
    allowedProjects: allowedProjects || ''
  }

  if (password && password.trim()) {
    const pw = password.trim()
    if (pw.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: '新密码不能少于 6 个字符。'
      })
    }
    updateData.password = hashPassword(pw)
  }

  try {
    await dbUpdateUser(event, id, updateData)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新用户资料与权限失败。'
    })
  }
})
