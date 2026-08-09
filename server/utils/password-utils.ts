import crypto from 'crypto';

/**
 * Unified dynamic password generator using SHA256
 * Supports optional dateInput (ISO string or YYYY-MM-DD) for historical request date passwords.
 */
export function getDailyPassword(
  projectSlug: string,
  secretKey?: string,
  dateInput?: string
): string {
  secretKey = secretKey || process.env.XO_PROJECT_PASSWORD_SECRET || ''
  if (!secretKey) throw new Error('XO_PROJECT_PASSWORD_SECRET is not configured')
  const cleanSlug = String(projectSlug || 'default').trim().toLowerCase();
  if (!cleanSlug) return '123456';

  let dateStr = ''
  if (dateInput) {
    try {
      const d = new Date(dateInput)
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
      } else {
        dateStr = dateInput
      }
    } catch {
      dateStr = dateInput
    }
  }
  if (!dateStr) {
    dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  }

  const seed = 'project_' + cleanSlug + '*date*' + dateStr + '*salt*' + secretKey;

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
  if (!inputPassword || !validPassword) return false;
  const normalizedInput = inputPassword.toString().trim().toUpperCase();
  const normalizedValid = validPassword.toString().trim().toUpperCase();
  return normalizedInput === normalizedValid;
}
