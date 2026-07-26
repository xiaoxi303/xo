import crypto from 'crypto';

/**
 * 纯函数：给定 projectSlug 和当天日期，24小时内无论调用多少次，结果 100% 相同！
 * 严禁使用任何随机数或当前毫秒时间！
 */
export function getDailyPassword(projectSlug: string, secretKey: string = 'XO_STUDIO_SALT'): string {
  // 1. 防空处理：确保获取到作品的唯一标识
  const cleanSlug = String(projectSlug || 'default').trim().toLowerCase();
  if (!cleanSlug) return '123456';

  // 2. 强行指定 Asia/Shanghai 时区，锁定格式为 YYYY-MM-DD
  const todayDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });

  // 3. 拼接固定种子
  const seed = 'project_' + cleanSlug + '*date*' + todayDateStr + '*salt*' + secretKey;

  // 4. SHA256 哈希计算
  const hash = crypto.createHash('sha256').update(seed).digest('hex');

  // 5. 映射为 6 位大写密码 (排除 0, O, 1, I, L 等易混淆字符)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let dailyCode = '';
  for (let i = 0; i < 6; i++) {
    const charIndex = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % charset.length;
    dailyCode += charset[charIndex];
  }

  return dailyCode;
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
