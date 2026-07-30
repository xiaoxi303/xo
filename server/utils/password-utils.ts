import crypto from 'crypto';

/**
 * Unified dynamic password generator using SHA256
 */
export function getDailyPassword(projectSlug: string, secretKey: string = 'XO_STUDIO_SALT'): string {
  const cleanSlug = String(projectSlug || 'default').trim().toLowerCase();
  if (!cleanSlug) return '123456';

  const todayDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const seed = 'project_' + cleanSlug + '*date*' + todayDateStr + '*salt*' + secretKey;

  const hash = crypto.createHash('sha256').update(seed).digest('hex');

  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let dailyCode = '';
  for (let i = 0; i < 6; i++) {
    const charIndex = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % charset.length;
    dailyCode += charset[charIndex];
  }
  return dailyCode;
}

export function getBeijingDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

export function verifyProjectPassword(inputPassword: string, validPassword: string): boolean {
  const normalizedInput = (inputPassword || '').toString().trim().toUpperCase();
  const normalizedValid = (validPassword || '').toString().trim().toUpperCase();
  return normalizedInput === normalizedValid;
}
