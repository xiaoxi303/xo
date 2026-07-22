import { dbCreateUser } from '../../utils/db'
import { hashPassword } from '../../utils/auth'

const ALLOWED_EMAIL_DOMAINS = [
  'qq.com', 'vip.qq.com', 'foxmail.com',
  '163.com', '126.com', 'yeah.net',
  'gmail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'yahoo.com', 'sohu.com', 'sina.com', 'sina.cn',
  'aliyun.com', '139.com', '189.com', 'wo.cn'
]

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

  if (email) {
    const parts = email.split('@')
    if (parts.length !== 2) {
      throw createError({
        statusCode: 400,
        statusMessage: '请输入有效的邮箱地址。'
      })
    }
    const domain = parts[1].toLowerCase()
    if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
      throw createError({
        statusCode: 400,
        statusMessage: '注册邮箱只支持主流常用邮箱后缀（如 QQ、网易 163/126、Gmail、Outlook 等）。'
      })
    }
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
