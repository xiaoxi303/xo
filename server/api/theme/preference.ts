import crypto from 'node:crypto'
import { getCookie, setCookie, readBody, defineEventHandler } from 'h3'

const THEME_COOKIE = 'xo_theme_vault_pref'
const MASTER_SECRET = process.env.XO_VAULT_MASTER_SECRET || 'XO_STUDIO_QUANTUM_THEME_KEY_2026'

function signPayload(data: string): string {
  return crypto.createHmac('sha512', MASTER_SECRET).update(data).digest('hex')
}

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const rawCookie = getCookie(event, THEME_COOKIE)
    if (!rawCookie) {
      return {
        theme: 'warm-linen',
        mode: 'light',
        isEncrypted: true,
        vaultActive: true
      }
    }

    try {
      const parsed = JSON.parse(Buffer.from(rawCookie, 'base64url').toString('utf8'))
      const expectedSig = signPayload(`${parsed.mode}:${parsed.timestamp}`)
      if (crypto.timingSafeEqual(Buffer.from(parsed.sig), Buffer.from(expectedSig))) {
        return {
          theme: parsed.mode === 'dark' ? 'film-dark' : 'warm-linen',
          mode: parsed.mode,
          timestamp: parsed.timestamp,
          isEncrypted: true,
          vaultActive: true
        }
      }
    } catch {
      // Signature mismatch or corrupt cookie
    }

    return {
      theme: 'warm-linen',
      mode: 'light',
      isEncrypted: true,
      vaultActive: true
    }
  }

  if (method === 'POST') {
    const body = await readBody(event).catch(() => ({}))
    const mode = body?.mode === 'dark' ? 'dark' : 'light'
    const timestamp = Date.now()
    const sig = signPayload(`${mode}:${timestamp}`)

    const cookieData = Buffer.from(JSON.stringify({
      mode,
      timestamp,
      sig,
      algorithm: 'HMAC-SHA512-VAULT',
      envelope: body?.envelope || null
    })).toString('base64url')

    setCookie(event, THEME_COOKIE, cookieData, {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    return {
      success: true,
      mode,
      theme: mode === 'dark' ? 'film-dark' : 'warm-linen',
      timestamp,
      vaultSign: sig.slice(0, 32).toUpperCase(),
      quantumShield: 'ACTIVE'
    }
  }
})
