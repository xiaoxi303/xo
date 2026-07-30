/**
 * Top-Tier Client Anti-Scraping & Code Protection Plugin for Xo Studio
 * 100% Local Browser Security, Zero Backdoors, Zero External Dependencies
 */

export default defineNuxtPlugin(() => {
  if (!import.meta.client || typeof window === 'undefined') return

  // Only activate strict anti-inspection in production environment
  const isProd = process.env.NODE_ENV === 'production'

  // ── 1. Anti-Keyboard Inspection Shortcuts (F12, Ctrl+Shift+I, Ctrl+U, etc.) ────
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      if (isProd) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect), Ctrl+U (View Source)
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase()
      if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || key === 'k')) {
        if (isProd) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }
      if (key === 'u' || key === 's') {
        if (isProd) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      }
    }
  }, { capture: true })

  // ── 2. Headless Automated Scraper / Bot Detector ──────────────────────
  const isHeadlessScraper = () => {
    const nav = navigator as any
    if (!nav) return false
    return (
      !!nav.webdriver ||
      !!window.callPhantom ||
      !!window._phantom ||
      !!window.__nightmare ||
      /HeadlessChrome|Puppeteer|PhantomJS|Selenium/i.test(nav.userAgent || '')
    )
  }

  if (isHeadlessScraper() && isProd) {
    console.warn('[Security Guard] Automated scraper detected.')
  }

  // ── 3. Console Memory Leak Protection in Production ───────────────────
  if (isProd) {
    try {
      const dummy = () => {}
      window.console.log = dummy
      window.console.info = dummy
      window.console.debug = dummy
      window.console.trace = dummy
    } catch {}
  }
})
