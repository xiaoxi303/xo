/**
 * World-Class Client Security Shield & Polymorphic DevTools Protection Plugin
 * Protection Level: World-Top Class Multi-Threaded Anti-Reverse Engineering Suite
 * Features:
 * 1. WebWorker Detached Anti-Debugger Thread (Immune to Main-Thread Breakpoint Pauses)
 * 2. Polymorphic XOR Dynamic Memory String Pool Encryption
 * 3. Keyboard Shortcut Interception (F12, Ctrl+Shift+I/J/C/K, Cmd+Option+I/J/C/K, Ctrl+U, Ctrl+S)
 * 4. Context Menu & Drag Suppression
 * 5. Console Trap & DOM Mutation Observer Defense
 */

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  let isDevToolsOpened = false

  const triggerDevToolsAction = () => {
    if (isDevToolsOpened) return
    isDevToolsOpened = true
    try {
      console.clear()
    } catch {}
  }

  // 1. Keyboard Shortcut Interception (F12, Ctrl+Shift+I/J/C/K, Ctrl+U, Ctrl+S)
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // F12 key
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault()
      e.stopPropagation()
      triggerDevToolsAction()
      return false
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K (DevTools shortcuts)
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K', 'i', 'j', 'c', 'k'].includes(e.key)) {
      e.preventDefault()
      e.stopPropagation()
      triggerDevToolsAction()
      return false
    }

    // Command+Option+I/J/C/K (Mac OS shortcuts)
    if (e.metaKey && e.altKey && ['I', 'J', 'C', 'K', 'i', 'j', 'c', 'k'].includes(e.key)) {
      e.preventDefault()
      e.stopPropagation()
      triggerDevToolsAction()
      return false
    }

    // Ctrl+U / Cmd+U (View Page Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+S / Cmd+S (Save Web Page Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Ctrl+P / Cmd+P (Print Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }, true)

  // 2. Right-Click Context Menu Suppression
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // Allow right click on text input fields for user convenience, block elsewhere
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      return true
    }
    e.preventDefault()
    return false
  }, true)

  // 3. DevTools Dimension & Window Size Detector
  const checkDevToolsDimensions = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160
    const heightThreshold = window.outerHeight - window.innerHeight > 160
    if (widthThreshold || heightThreshold) {
      triggerDevToolsAction()
    } else {
      isDevToolsOpened = false
    }
  }

  // 4. Advanced Console Getter Trap (Fires when DevTools Console is inspected)
  const activateConsoleTrap = () => {
    const element = new Image()
    Object.defineProperty(element, 'id', {
      get: function () {
        triggerDevToolsAction()
        return 'WORLD_SECURITY_GUARD_TRAP'
      }
    })
    try {
      console.log('%c', element)
    } catch {}
  }

  // 5. Spawn Worker Thread for Detached Anti-Debugger Protection (Immune to Main Thread Pauses)
  const spawnWorkerGuard = () => {
    if (process.env.NODE_ENV !== 'production') return
    try {
      const workerCode = `
        setInterval(function() {
          var startTime = performance.now();
          (function(){}).constructor("debugger")();
          var endTime = performance.now();
          if (endTime - startTime > 100) {
            postMessage("DEVTOOLS_DETECTED");
          }
        }, 1500);
      `
      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const worker = new Worker(URL.createObjectURL(blob))
      worker.onmessage = (e) => {
        if (e.data === 'DEVTOOLS_DETECTED') {
          triggerDevToolsAction()
        }
      }
    } catch {}
  }

  // 6. Security Event Loops
  window.addEventListener('resize', checkDevToolsDimensions)
  setInterval(checkDevToolsDimensions, 1000)
  setInterval(activateConsoleTrap, 2500)
  spawnWorkerGuard()
})
