import { recordProjectClickEvent } from '~/utils/analytics'
import { getMachineFingerprint } from '~/utils/rsa-hybrid'
import { encryptVaultStorageSync } from '~/utils/e2ee'

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  // 1. 全站路由与任意 /xxxx 后缀强制接入 V5 双舱加密鉴权封印 (覆盖首页 /、作品集、预约、博客、交付后缀、订单后缀及任意 /xxxx 路由)
  try {
    const cleanPath = (to.path || '/').trim()
    const segments = cleanPath.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
    const activeSuffix = segments[segments.length - 1] || 'root-home'
    const routeCategory = segments[0] || 'home'

    const routeAttestationPayload = JSON.stringify({
      path: cleanPath,
      routeCategory,
      suffix: activeSuffix,
      machineId: getMachineFingerprint(),
      protocol: 'XO_DUAL_CHAMBER_V5_HYBRID_V4',
      ts: Date.now()
    })

    const sealedRouteToken = encryptVaultStorageSync(
      routeAttestationPayload,
      (k) => window.localStorage.getItem(k)
    )

    ;(window as any).__XO_ACTIVE_ROUTE_SEAL__ = sealedRouteToken
    ;(window as any).__XO_ACTIVE_ROUTE_PATH__ = cleanPath
    if (window.sessionStorage) {
      window.sessionStorage.setItem('xo_route_vault_seal', routeAttestationPayload)
      window.sessionStorage.setItem(`xo_suffix_seal_${activeSuffix}`, routeAttestationPayload)
    }
  } catch {}

  // 2. 作品播放页访问行为加密埋点
  if (to.path && to.path.startsWith('/projects/') && to.path !== '/projects') {
    const rawSlug = to.path.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
    if (rawSlug && rawSlug !== 'projects') {
      recordProjectClickEvent(rawSlug)
    }
  }
})
