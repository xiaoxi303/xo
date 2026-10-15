/**
 * XO STUDIO · 防爬虫邮箱混淆与动态解密装甲 (Anti-Scraping Armored Email Engine)
 * 
 * 核心原理：
 * 1. 服务端下发给前台访客时，原始邮箱经过 0x7E 异或变换与 Base64URL 装甲封装；
 * 2. 网页源码与 SSR 响应中绝不包含明文 '@' 与邮件域名，使全网爬虫搜集器彻底失效；
 * 3. 前端在客户端运行时通过动态解密器，在真实访客交互时还原，并支持一键复制与调起客户端。
 */

export function dearmorEmail(armored?: string | null): string {
  if (!armored || typeof armored !== 'string') return ''
  const trimmed = armored.trim()
  if (!trimmed.startsWith('XO_ARMOR_')) {
    if (trimmed.includes('@') && !trimmed.includes('protected')) {
      return trimmed
    }
    return ''
  }

  try {
    const raw = trimmed.slice('XO_ARMOR_'.length)
    const base64 = raw.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '==='.slice((base64.length + 3) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i) ^ 0x7E
    }
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

/**
 * 智能解析联系邮箱 (优先从装甲字段解码，兼容普通字段)
 */
export function resolveSafeEmail(siteInfo?: any, defaultEmail = 'hello@xo.dev'): string {
  if (!siteInfo) return defaultEmail
  if (siteInfo.contactEmailArmored) {
    const decoded = dearmorEmail(siteInfo.contactEmailArmored)
    if (decoded) return decoded
  }
  if (siteInfo.contactEmail && siteInfo.contactEmail !== 'protected') {
    return siteInfo.contactEmail
  }
  return defaultEmail
}
