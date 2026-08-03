import { dbCreateUser } from '../../utils/db'
import { hashPassword, createSession, CLIENT_SESSION_COOKIE, SESSION_COOKIE_OPTS } from '../../utils/auth'
import { verifyAndConsumeCode } from '../../utils/verification'

const ALLOWED_EMAIL_DOMAINS = [
  'qq.com', 'vip.qq.com', 'foxmail.com',
  '163.com', '126.com', 'yeah.net',
  'gmail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'yahoo.com', 'sohu.com', 'sina.com', 'sina.cn',
  'aliyun.com', '139.com', '189.com', 'wo.cn'
]

import { isE2EEPayload, decryptE2EE } from '../../utils/e2ee'

export default defineEventHandler(async (event) => {
  let body = await readBody(event)

  // Handle E2EE payload decryption if client sent E2EE encrypted request
  if (isE2EEPayload(body)) {
    try {
      const decryptedString = decryptE2EE(body)
      body = JSON.parse(decryptedString)
    } catch (e: any) {
      throw createError({ statusCode: 400, statusMessage: 'E2EE 解密失败：请求数据损坏或被篡改。' })
    }
  }

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
  const code = body.code ? body.code.trim() : ''
  const wechat = body.wechat ? body.wechat.trim() : ''

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入电子邮箱地址。'
    })
  }

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

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入邮箱验证码。'
    })
  }

  // Verify email verification code
  const verification = verifyAndConsumeCode(email, code)
  if (!verification.success) {
    throw createError({
      statusCode: 400,
      statusMessage: verification.message || '验证码错误，请重新输入。'
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

    // Auto-login user after successful registration
    const token = createSession(username)
    setCookie(event, CLIENT_SESSION_COOKIE, token, SESSION_COOKIE_OPTS)

    return {
      success: true,
      username,
      role: 'client'
    }
  } catch (error: any) {
    console.error('Failed to register user:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '注册失败，请稍后重试。'
    })
  }
})
