import { setHeader } from 'h3'
import { getRsaPublicKey } from '../../utils/vault-cipher'
import { getRealClientIP } from '../../utils/ip-helper'

export default defineEventHandler((event) => {
  // 杜绝反向代理、CDN 与浏览器对一次性公钥票据发生缓存
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  const ip = getRealClientIP(event)
  return getRsaPublicKey(ip)
})
