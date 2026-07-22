import { dbCreateUser } from '../../utils/db'
import { hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.username || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名和密码为必填项。'
    })
  }

  const username = body.username.trim()
  if (username.length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名不能少于 3 个字符。'
    })
  }

  const password = body.password.trim()
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: '密码不能少于 6 个字符。'
    })
  }

  const email = body.email ? body.email.trim() : ''
  const wechat = body.wechat ? body.wechat.trim() : ''

  if (!email && !wechat) {
    throw createError({
      statusCode: 400,
      statusMessage: '邮箱和微信号必须选择填写一项以完成注册。'
    })
  }

  const hashedPassword = hashPassword(password)

  try {
    await dbCreateUser(event, {
      username,
      email,
      wechat,
      password: hashedPassword,
      role: 'client'
    })
    return { success: true }
  } catch (error: any) {
    console.error('Failed to register user:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '注册失败，请稍后重试。'
    })
  }
})
