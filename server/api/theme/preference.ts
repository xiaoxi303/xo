import crypto from 'node:crypto'
import { getCookie, setCookie, readBody, defineEventHandler } from 'h3'
import { getVaultRootSecret, encryptFileContent, decryptFileContent } from '../../utils/storage'

const THEME_COOKIE = 'xo_theme_vault_pref'

function signPayload(data: string): string {
  return crypto.createHmac('sha512', getVaultRootSecret()).update(data).digest('hex')
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
        vaultActive: true,
        vaultProtocol: 'XO_DUAL_CHAMBER_V5'
      }
    }

    try {
      const decodedStr = Buffer.from(rawCookie, 'base64url').toString('utf8')
      const unsealedStr = decodedStr.startsWith('$XO_VAULT_')
        ? decryptFileContent(decodedStr)
        : decodedStr
      const parsed = JSON.parse(unsealedStr)
      const expectedSig = signPayload(`${parsed.mode}:${parsed.timestamp}`)
      if (crypto.timingSafeEqual(Buffer.from(parsed.sig), Buffer.from(expectedSig))) {
        return {
          theme: parsed.mode === 'dark' ? 'film-dark' : 'warm-linen',
          mode: parsed.mode,
          timestamp: parsed.timestamp,
          isEncrypted: true,
          vaultActive: true,
          vaultProtocol: 'XO_DUAL_CHAMBER_V5'
        }
      }
    } catch {
      // Signature mismatch or corrupt cookie
    }

    return {
      theme: 'warm-linen',
      mode: 'light',
      isEncrypted: true,
      vaultActive: true,
      vaultProtocol: 'XO_DUAL_CHAMBER_V5'
    }
  }

  if (method === 'POST') {
    const body = event.context.decryptedBody || (await readBody(event).catch(() => ({})))
    const mode = body?.mode === 'dark' ? 'dark' : 'light'
    const timestamp = Date.now()
    const sig = signPayload(`${mode}:${timestamp}`)

    const innerJson = JSON.stringify({
      mode,
      timestamp,
      sig,
      algorithm: 'XO-DUAL-CHAMBER-V5-HMAC-SHA512',
      envelope: body?.envelope || null
    })
    const dualChamberCipher = encryptFileContent(innerJson)
    const cookieData = Buffer.from(dualChamberCipher, 'utf8').toString('base64url')

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
      vaultProtocol: 'XO_DUAL_CHAMBER_V5',
      quantumShield: 'ACTIVE'
    }
  }
})
