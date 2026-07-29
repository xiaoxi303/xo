# -*- coding: utf-8 -*-
with open(r'app/utils/analytics.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add debounce to prevent rapid-fire clicks
old_function = '''export function recordProjectClickEvent(slug: string, title?: string) {
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
}'''

new_function = '''// Debounce map to prevent rapid-fire clicks
const clickDebounceMap = new Map<string, number>()

export function recordProjectClickEvent(slug: string, title?: string) {
  if (typeof window === 'undefined' || !slug) return

  const cleanSlug = slug.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
  if (!cleanSlug || cleanSlug === 'projects') return

  // Debounce: ignore if same slug was clicked within 1 second
  const now = Date.now()
  const lastClick = clickDebounceMap.get(cleanSlug) || 0
  if (now - lastClick < 1000) return
  clickDebounceMap.set(cleanSlug, now)

  // Clean up old entries periodically
  if (clickDebounceMap.size > 100) {
    for (const [key, time] of clickDebounceMap) {
      if (now - time > 60000) clickDebounceMap.delete(key)
    }
  }

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
}'''

content = content.replace(old_function, new_function)

with open(r'app/utils/analytics.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: Added debounce to recordProjectClickEvent')
