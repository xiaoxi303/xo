/**
 * Robust Cross-Platform Clipboard Copy Utility
 * Supports modern Clipboard API with bulletproof execCommand fallback for non-secure HTTP contexts (e.g. 0.0.0.0, IP LAN)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || typeof window === 'undefined') return false

  // Method 1: Modern asynchronous Clipboard API (https or localhost)
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      // Modern API may fail due to lack of document focus or insecure context (e.g. 0.0.0.0)
    }
  }

  // Method 2: Synchronous document.execCommand('copy') fallback
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text

    // Avoid scrolling and layout disruptions
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.width = '2em'
    textArea.style.height = '2em'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.boxShadow = 'none'
    textArea.style.background = 'transparent'
    textArea.style.opacity = '0'
    textArea.setAttribute('readonly', '')

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, text.length)

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    if (successful) return true
  } catch (err) {
    // Continue to prompt fallback
  }

  // Method 3: Manual prompt fallback if both fail
  try {
    window.prompt('请按 Ctrl+C / Cmd+C 复制以下内容：', text)
    return true
  } catch {
    return false
  }
}

/**
 * Normalizes host origin so 0.0.0.0 is replaced with localhost/127.0.0.1
 */
export function getNormalizedOrigin(): string {
  if (typeof window === 'undefined') return ''
  let origin = window.location.origin
  if (window.location.hostname === '0.0.0.0') {
    origin = origin.replace('0.0.0.0', 'localhost')
  }
  return origin
}
