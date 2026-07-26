import crypto from 'crypto';

/**
 * 全局统一动态密码生成器
 * 保证输入相同的 projectIdentifier 和日期，算出的密码 100% 一致
 */
export function getDailyPassword(projectIdentifier: string, secretKey: string = 'XO_STUDIO_2026_LOCK'): string {
  // 1. 强行清洗标识符（防止 null/undefined/大小写混淆）
  const cleanId = String(projectIdentifier || '').trim().toLowerCase();
  if (!cleanId) return '123456';

  // 2. 强制使用 Asia/Shanghai 时区格式化 YYYY-MM-DD
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });

  // 3. 唯一种子拼接
  const seed = 'PROJECT_' + cleanId + '*DATE*' + todayStr + '*SALT*' + secretKey;

  // 4. SHA256 哈希取前 6 位大写字符
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let password = '';
  for (let i = 0; i < 6; i++) {
    const charIndex = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % charset.length;
    password += charset[charIndex];
  }
  return password;
}

/**
 * 获取北京时间的日期字符串 (YYYY-MM-DD)
 */
export function getBeijingDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

/**
 * 验证密码是否匹配（统一转大写并去除空格后比较）
 */
export function verifyPassword(inputPassword: string, validPassword: string): boolean {
  const normalizedInput = (inputPassword || '').toString().trim().toUpperCase();
  const normalizedValid = (validPassword || '').toString().trim().toUpperCase();
  return normalizedInput === normalizedValid;
}
