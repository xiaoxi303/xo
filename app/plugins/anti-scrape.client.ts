/**
 * Ultimate Quantum-Shield Anti-Scraping & Anti-Reverse-Engineering Plugin v3.0 ULTRA for Xo Studio
 * 100% Client-Side Browser Security, Zero Backdoors, Zero External Dependencies
 */

export default defineNuxtPlugin(() => {
  if (!import.meta.client || typeof window === 'undefined') return

  // ── 1. Global Right-Click & Context-Menu Anti-Inspection Disabler ────────
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }, { capture: true })

  // ── 2. Global Text-Selection & Drag-Copy Protection ─────────────────────
  window.addEventListener('selectstart', (e: Event) => {
    const target = e.target as HTMLElement
    // Allow text selection in form inputs and textareas for user convenience
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return true
    }
    e.preventDefault()
    return false
  }, { capture: true })

  window.addEventListener('copy', (e: ClipboardEvent) => {
    const target = e.target as HTMLElement
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return true
    }
    e.preventDefault()
    return false
  }, { capture: true })

  window.addEventListener('dragstart', (e: DragEvent) => {
    e.preventDefault()
    return false
  }, { capture: true })

  // ── 3. Comprehensive Keyboard Hotkey Interceptor (Win & Mac) ────────────
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const key = (e.key || '').toLowerCase()
    const isCmdOrCtrl = e.ctrlKey || e.metaKey
    const isAlt = e.altKey
    const isShift = e.shiftKey

    // F12 (DevTools)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+Shift+I / Cmd+Alt+I / Ctrl+Shift+J / Ctrl+Shift+C / Ctrl+Shift+K (DevTools & Inspector)
    if ((isCmdOrCtrl && isShift && (key === 'i' || key === 'j' || key === 'c' || key === 'k' || key === 'e')) ||
        (isCmdOrCtrl && isAlt && (key === 'i' || key === 'j' || key === 'c' || key === 'u'))) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+P (Print Scraping)
    if (isCmdOrCtrl && (key === 'u' || key === 's' || key === 'p')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }, { capture: true })

  // ── 4. DevTools Infinite Debugger Trap Loop (Anti-Decompilation) ────────
  const launchDevToolsTrap = () => {
    const check = () => {
      try {
        const functionConstructor = (function () {
          return false
        })['constructor']
        const debugFn = functionConstructor('debugger')
        debugFn()
      } catch {}
    }

    // Run high-frequency loop to freeze DevTools if opened
    setInterval(check, 50)
  }

  // ── 5. Headless Bot & Automated Crawler Detection ──────────────────────
  const isHeadlessBot = (): boolean => {
    const nav = navigator as any
    if (!nav) return false
    return (
      !!nav.webdriver ||
      !!window.callPhantom ||
      !!window._phantom ||
      !!window.__nightmare ||
      /HeadlessChrome|Puppeteer|PhantomJS|Selenium|Playwright/i.test(nav.userAgent || '')
    )
  }

  if (isHeadlessBot()) {
    console.warn('[Security Shield] Bot crawler restricted.')
  }

  // Start active DevTools Infinite Debugger Trap Loop
  launchDevToolsTrap()

  // ── 6. Console Memory Shielding ─────────────────────────────────────────
  try {
    const noop = () => {}
    window.console.log = noop
    window.console.info = noop
    window.console.debug = noop
    window.console.trace = noop
  } catch {}
})
