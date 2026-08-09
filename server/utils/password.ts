/**
 * 密码生成工具函数
 * 生成 6 位大写字母 + 数字组合，排除容易混淆的字符
 */

// 排除容易混淆的字符：O/0, I/1, L/1
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * 生成随机密码
 * @param length 密码长度，默认 6
 * @returns 6 位大写字母 + 数字组合
 */
export function generatePassword(length: number = 6): string {
  let password = ''
  const charsLength = SAFE_CHARS.length
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsLength)
    password += SAFE_CHARS[randomIndex]
  }
  
  return password
}

/**
 * 基于日期和作品ID生成动态密码
 * 使用 hash 算法确保每天生成不同的密码
 * @param projectId 作品 ID/Slug
 * @param date 日期字符串 YYYY-MM-DD
 * @param secret 密钥
 * @returns 6 位密码
 */
export function generateDailyPassword(
  projectId: string, 
  date: string, 
  secret: string = typeof process !== 'undefined' ? (process.env.XO_PROJECT_PASSWORD_SECRET || '') : ''
): string {
  if (!secret) throw new Error('XO_PROJECT_PASSWORD_SECRET is not configured')
  // 简单的 hash 函数
  const hash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为 32 位整数
    }
    return Math.abs(hash)
  }
  
  // 组合输入
  const input = `${projectId}-${date}-${secret}`
  const hashValue = hash(input)
  
  // 从 hash 值生成 6 位密码
  let password = ''
  let value = hashValue
  
  for (let i = 0; i < 6; i++) {
    const index = value % SAFE_CHARS.length
    password += SAFE_CHARS[index]
    value = Math.floor(value / SAFE_CHARS.length)
  }
  
  return password
}

/**
 * 获取当前日期字符串 (YYYY-MM-DD)
 * 使用北京时间 (UTC+8)
 */
export function getCurrentDateString(): string {
  const now = new Date()
  // 转换为北京时间
  const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return beijingTime.toISOString().split('T')[0]
}

/**
 * 检查密码是否在今天有效
 * @param updatedAt 密码更新时间
 * @returns 是否有效
 */
export function isPasswordValidToday(updatedAt: string | Date): boolean {
  const today = getCurrentDateString()
  const updatedDate = typeof updatedAt === 'string' ? updatedAt : updatedAt.toISOString().split('T')[0]
  return updatedDate === today
}

/**
 * 获取 localStorage 中的解锁凭证 key
 * @param projectSlug 作品 slug
 * @returns localStorage key
 */
export function getUnlockKey(projectSlug: string): string {
  const today = getCurrentDateString()
  return `unlocked_${projectSlug}_${today}`
}

/**
 * 检查本地解锁凭证是否有效
 * @param projectSlug 作品 slug
 * @returns 是否已解锁
 */
export function checkLocalUnlock(projectSlug: string): boolean {
  if (typeof window === 'undefined') return false
  
  const key = getUnlockKey(projectSlug)
  const unlocked = localStorage.getItem(key)
  
  // 清理过期的凭证
  cleanExpiredUnlocks()
  
  return unlocked === 'true'
}

/**
 * 保存解锁凭证到本地
 * @param projectSlug 作品 slug
 */
export function saveLocalUnlock(projectSlug: string): void {
  if (typeof window === 'undefined') return
  
  const key = getUnlockKey(projectSlug)
  localStorage.setItem(key, 'true')
}

/**
 * 清理过期的解锁凭证
 */
export function cleanExpiredUnlocks(): void {
  if (typeof window === 'undefined') return
  
  const today = getCurrentDateString()
  const keysToRemove: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('unlocked_')) {
      // 提取日期部分
      const parts = key.split('_')
      const date = parts[parts.length - 1]
      
      // 如果日期不是今天，标记删除
      if (date !== today) {
        keysToRemove.push(key)
      }
    }
  }
  
  // 删除过期的凭证
  keysToRemove.forEach(key => localStorage.removeItem(key))
}
