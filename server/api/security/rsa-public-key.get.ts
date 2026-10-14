import { getRsaPublicKey } from '../../utils/rsa-hybrid'
import { getRealClientIP } from '../../utils/ip-helper'

export default defineEventHandler((event) => {
  const ip = getRealClientIP(event)
  return getRsaPublicKey(ip)
})
