import crypto from 'crypto';

/**
 * 根据作品ID和当前日期生成固定的6位动态密码（24小时内固定不变）
 * 使用 SHA256 哈希算法确保确定性
 */
export function getDailyPassword(projectId: string, secretKey: string = 'xo-studio-2026'): string {
  // 1. 强制统一时区（Asia/Shanghai），确保全局日期字符串严格为 YYYY-MM-DD
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });

  // 2. 将作品ID + 日期 + 系统密钥 拼接生成唯一的种子字符串
  const seed = projectId + '*' + todayStr + '*' + secretKey;

  // 3. 计算 SHA256 哈希值
  const hash = crypto.createHash('sha256').update(seed).digest('hex');

  // 4. 映射为 6 位纯大写字母与数字组合（排除易混淆字符 O, 0, I, 1）
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

/**
 * 兼容旧接口
 */
export function generateDailyPassword(projectSlug: string, dateStr?: string): string {
  return getDailyPassword(projectSlug);
}
