/**
 * 统一的密码工具函数
 * 确保前后端使用完全相同的算法生成动态密码
 */

// 排除容易混淆的字符：O/0, I/1, L/l
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * 获取北京时间的日期字符串 (YYYY-MM-DD)
 * 使用 UTC+8 时区
 */
export function getBeijingDateString(): string {
  const now = new Date()
  // 获取 UTC 时间戳，然后加 8 小时得到北京时间
  const utcTimestamp = now.getTime() + (now.getTimezoneOffset() * 60000)
  const beijingTimestamp = utcTimestamp + (8 * 3600000)
  const beijingDate = new Date(beijingTimestamp)
  
  const year = beijingDate.getUTCFullYear()
  const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(beijingDate.getUTCDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 基于作品ID和日期生成动态密码
 * 使用确定性算法，确保同一输入总是产生相同输出
 */
export function generateDailyPassword(projectSlug: string, dateStr?: string): string {
  const date = dateStr || getBeijingDateString()
  const secret = 'xo-studio-2026'
  
  // 组合输入字符串
  const input = `${projectSlug}|${date}|${secret}`
  
  // 简单的哈希函数
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为 32 位整数
  }
  hash = Math.abs(hash)
  
  // 从哈希值生成 6 位密码
  let password = ''
  let value = hash
  for (let i = 0; i < 6; i++) {
    const index = value % SAFE_CHARS.length
    password += SAFE_CHARS[index]
    value = Math.floor(value / SAFE_CHARS.length)
  }
  
  return password
}

/**
 * 验证密码是否匹配
 * 统一转大写并去除空格后比较
 */
export function verifyPassword(inputPassword: string, validPassword: string): boolean {
  const normalizedInput = inputPassword.trim().toUpperCase()
  const normalizedValid = validPassword.trim().toUpperCase()
  return normalizedInput === normalizedValid
}
