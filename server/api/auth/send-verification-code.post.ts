import { dbGetUsers } from '../../utils/db'
import { sendVerificationCodeEmail } from '../../utils/email'
import { generateVerificationCode, storeVerificationCode, getCooldownRemaining } from '../../utils/verification'

const ALLOWED_EMAIL_DOMAINS = [
  'qq.com', 'vip.qq.com', 'foxmail.com',
  '163.com', '126.com', 'yeah.net',
  'gmail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'yahoo.com', 'sohu.com', 'sina.com', 'sina.cn',
  'aliyun.com', '139.com', '189.com', 'wo.cn'
]

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = body?.email ? body.email.trim().toLowerCase() : ''

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
      statusMessage: '请输入格式正确的电子邮箱地址。'
    })
  }

  const domain = parts[1].toLowerCase()
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    throw createError({
      statusCode: 400,
      statusMessage: '注册邮箱只支持主流常用邮箱后缀（如 QQ、网易 163/126、Gmail、Outlook 等）。'
    })
  }

  // Check 60s sending cooldown
  const remainingCooldown = getCooldownRemaining(email, 60)
  if (remainingCooldown > 0) {
    throw createError({
      statusCode: 429,
      statusMessage: `验证码发送频繁，请 ${remainingCooldown} 秒后再试。`
    })
  }

  // Check if email is already registered
  const existingUsers = await dbGetUsers(event)
  const isRegistered = existingUsers.some(u => u.email && u.email.trim().toLowerCase() === email)
  if (isRegistered) {
    throw createError({
      statusCode: 400,
      statusMessage: '该邮箱已被注册，请直接登录。'
    })
  }

  // Generate code & send email
  const code = generateVerificationCode()
  const result = await sendVerificationCodeEmail(event, { toEmail: email, code })

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.message || '发送验证码邮件失败，请检查邮箱地址或稍后重试。'
    })
  }

  // Store code only on successful send (valid for 60 seconds)
  storeVerificationCode(email, code, 60)

  return {
    success: true,
    message: '验证码已发送至您的邮箱，有效期为 60 秒，请注意查收。'
  }
})
