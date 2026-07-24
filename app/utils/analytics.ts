export function recordProjectClickEvent(slug: string, title?: string) {
  if (typeof window === 'undefined' || !slug) return

  const cleanSlug = slug.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
  if (!cleanSlug || cleanSlug === 'projects') return

  const payload = JSON.stringify({
    event: 'project_click',
    meta: JSON.stringify({ slug: cleanSlug, title: title || cleanSlug })
  })

  const targetUrl = `/api/analytics/event?event=project_click&slug=${encodeURIComponent(cleanSlug)}`

  try {
    fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true
    }).catch(() => {})
  } catch {}
}
