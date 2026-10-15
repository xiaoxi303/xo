import { readBody, createError } from 'h3'
import { verifySecurityChallenge } from '../../utils/vault-cipher'
import { getRealClientIP } from '../../utils/ip-helper'

export default defineEventHandler(async (event) => {
  let body: any = event.context.decryptedBody || {}
  if (!body.challengeId) {
    try {
      body = (await readBody(event)) || body
    } catch {
      // fallback
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
