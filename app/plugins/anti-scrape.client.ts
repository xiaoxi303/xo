/**
 * High-Security Client Protection Plugin for Xo Studio
 * 100% Local Browser Security, Zero Backdoors, Zero External Dependencies
 */

export default defineNuxtPlugin(() => {
  if (!import.meta.client || typeof window === 'undefined') return

  const isProd = process.env.NODE_ENV === 'production'

  // ── 1. Right-Click Context Menu Protection (Production Only) ───────────
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    if (isProd) {
      // Allow right-click on editable elements
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return true
      }
      e.preventDefault()
      return false
    }
  })

  // ── 2. Keyboard DevTools Inspection Shield ─────────────────────────────
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!isProd) return
    const key = (e.key || '').toLowerCase()
    const isCmdOrCtrl = e.ctrlKey || e.metaKey
    const isShift = e.shiftKey

    // F12 Key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+I / Cmd+Opt+I (Inspect), Ctrl+Shift+J (Console), Ctrl+U (View Source)
    if (isCmdOrCtrl && isShift && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) {
      e.preventDefault()
      return false
    }
    if (isCmdOrCtrl && (key === 'u' || key === 's')) {
      e.preventDefault()
      return false
    }
  })

  // ── 3. Headless Bot Detection ───────────────────────────────────────────
  const nav = navigator as any
  if (nav && nav.webdriver && isProd) {
    console.warn('[Security Shield] Automated crawler detected.')
  }
})
