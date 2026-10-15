import { readBody, createError } from 'h3'
import { verifySecurityChallenge, decryptRsaHybrid, isRsaHybridPayload } from '../../utils/vault-cipher'
import { getRealClientIP } from '../../utils/ip-helper'

export default defineEventHandler(async (event) => {
  let body: any = event.context.decryptedBody || {}
  if (!body.challengeId) {
    try {
      const raw = await readBody(event)
      if (isRsaHybridPayload(raw)) {
        const decryptedString = await decryptRsaHybrid(raw, event)
        body = JSON.parse(decryptedString)
        event.context.decryptedBody = body
      } else if (raw && typeof raw === 'object') {
        body = raw
      }
    } catch (err: any) {
      console.error('[slider-verify] Decrypt fallback error:', err?.message || err)
    }
  }

  const clientIp = getRealClientIP(event)

  const result = verifySecurityChallenge({
    challengeId: String(body.challengeId || ''),
    powNonce: body.powNonce,
    duration: Number(body.duration || 0),
    entropy: body.entropy,
    selectedSymbol: body.selectedSymbol ? String(body.selectedSymbol) : undefined,
    slideX: body.slideX !== undefined ? Number(body.slideX) : undefined,
    trajectory: Array.isArray(body.trajectory) ? body.trajectory : [],
    clientIp
  })

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.reason || '人机安全校验未通过，请重新核验。'
    })
  }

  return {
    success: true,
    token: result.token
  }
})
