import crypto from 'crypto';

/**
 * Pure function: Given projectSlug and today's date, password is 100% identical no matter how many times called!
 * Strictly forbidden to use any random numbers or current millisecond time!
 */
export function getDailyPassword(projectSlug: string, secretKey: string = 'XO_STUDIO_SALT'): string {
  // 1. Clean identifier: ensure we get the unique slug
  const cleanSlug = String(projectSlug || 'default').trim().toLowerCase();
  if (!cleanSlug) return '123456';

  // 2. Force Asia/Shanghai timezone, lock format to YYYY-MM-DD
  const todayDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });

  // 3. Fixed seed
  const seed = 'project_' + cleanSlug + '*date*' + todayDateStr + '*salt*' + secretKey;

  // 4. SHA256 hash
  const hash = crypto.createHash('sha256').update(seed).digest('hex');

  // 5. Map to 6 uppercase chars (exclude 0, O, 1, I, L)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let dailyCode = '';
  for (let i = 0; i < 6; i++) {
    const charIndex = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % charset.length;
    dailyCode += charset[charIndex];
  }

  return dailyCode;
}

/**
 * Get Beijing date string (YYYY-MM-DD)
 */
export function getBeijingDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

/**
 * Verify password match (case-insensitive, trim spaces)
 */
export function verifyPassword(inputPassword: string, validPassword: string): boolean {
  const normalizedInput = (inputPassword || '').toString().trim().toUpperCase();
  const normalizedValid = (validPassword || '').toString().trim().toUpperCase();
  return normalizedInput === normalizedValid;
}
