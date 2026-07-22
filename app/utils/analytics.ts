export function recordProjectClickEvent(slug: string, title?: string) {
  if (typeof window === 'undefined' || !slug) return

  const cleanSlug = slug.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
  if (!cleanSlug || cleanSlug === 'projects') return

  const payload = JSON.stringify({
    event: 'project_click',
    meta: JSON.stringify({ slug: cleanSlug, title: title || cleanSlug })
  })

  // 1. Send via fetch with keepalive: true FIRST (ensures Content-Type: application/json)
  try {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {})
  } catch {}

  // 2. Also send via sendBeacon as guaranteed background backup
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([payload], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/event', blob)
    } catch {}
  }
}
