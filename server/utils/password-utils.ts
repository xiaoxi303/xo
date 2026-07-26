import crypto from 'crypto';

/**
 * Unified dynamic password generator
 * Same algorithm in frontend and backend for consistency
 */
export function getDailyPassword(projectSlug: string, secretKey: string = 'XO_STUDIO_SALT'): string {
  const cleanSlug = String(projectSlug || 'default').trim().toLowerCase();
  if (!cleanSlug) return '123456';

  const todayDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  const seed = 'project_' + cleanSlug + '*date*' + todayDateStr + '*salt*' + secretKey;

  // Simple deterministic hash (same as frontend)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  hash = Math.abs(hash);

  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let dailyCode = '';
  let value = hash;
  for (let i = 0; i < 6; i++) {
    const index = value % charset.length;
    dailyCode += charset[index];
    value = Math.floor(value / charset.length);
  }
  return dailyCode;
}

export function getBeijingDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

export function verifyPassword(inputPassword: string, validPassword: string): boolean {
  const normalizedInput = (inputPassword || '').toString().trim().toUpperCase();
  const normalizedValid = (validPassword || '').toString().trim().toUpperCase();
  return normalizedInput === normalizedValid;
}
