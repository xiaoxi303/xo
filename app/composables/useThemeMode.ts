import { ref, computed } from 'vue'
import { encryptE2EE, decryptE2EE, getE2EEFingerprint, isE2EESupported, verifyE2EEPayloadSignature } from '~/utils/e2ee'
import { getMachineFingerprint } from '~/utils/rsa-hybrid'

const isDark = ref(false)
const isAutoDevice = ref(true)
const systemPrefersDark = ref(false)
const isInitialized = ref(false)
const isEncrypting = ref(false)
const encryptionFingerprint = ref('QUANTUM-VAULT-INITIALIZING')
const securityLevel = ref('自研量子级端到端加密 E2EE V8.0')

const currentTheme = computed(() => (isDark.value ? 'film-dark' : 'warm-linen'))

/**
 * Apply theme classes and attributes to DOM root element
 */
function applyDomTheme(dark: boolean) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'film-dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'warm-linen')
    root.style.colorScheme = 'light'
  }
}

/**
 * Initialize theme with automatic device color-scheme detection
 * and self-developed quantum encrypted vault synchronization
 */
async function initTheme() {
  if (typeof window === 'undefined' || isInitialized.value) return

  try {
    if (isE2EESupported()) {
      encryptionFingerprint.value = await getE2EEFingerprint()
    }

    // 1. Detect visitor's device OS color-scheme preference
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    const deviceDark = !!mediaQuery?.matches
    systemPrefersDark.value = deviceDark

    // 2. Check if user explicitly clicked a manual override previously
    const isLocked = localStorage.getItem('xo_theme_user_locked') === 'true'

    if (isLocked) {
      isAutoDevice.value = false
      // Attempt reading decrypted choice from E2EE vault
      const encryptedData = localStorage.getItem('xo_vault_theme_e2ee')
      let resolvedDark: boolean | null = null

      if (encryptedData) {
        try {
          const envelope = JSON.parse(encryptedData)
          const check = await verifyE2EEPayloadSignature(envelope)
          if (check.valid) {
            const decryptedJson = await decryptE2EE(envelope)
            const parsed = JSON.parse(decryptedJson)
            if (parsed && typeof parsed.mode === 'string') {
              resolvedDark = parsed.mode === 'dark' || parsed.preset === 'film-dark'
            }
          }
        } catch (err) {
          console.warn('[Vault Theme] Encrypted payload decode error:', err)
        }
      }

      if (resolvedDark === null) {
        const legacyPreset = localStorage.getItem('xo_theme_preset')
        resolvedDark = legacyPreset === 'film-dark' || legacyPreset === 'dark'
      }

      isDark.value = resolvedDark
    } else {
      // Default: Automatically adapt according to visitor's device!
      isAutoDevice.value = true
      isDark.value = deviceDark
      // Persist device-adaptive state into encrypted vault
      persistEncryptedTheme(isDark.value, true).catch(() => {})
    }

    applyDomTheme(isDark.value)
    isInitialized.value = true

    // 3. Register real-time device color-scheme listener
    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', (e) => {
        systemPrefersDark.value = e.matches
        // If current mode is following device, automatically adapt in real-time
        if (isAutoDevice.value) {
          isDark.value = e.matches
          applyDomTheme(isDark.value)
          persistEncryptedTheme(isDark.value, true).catch(() => {})
        }
      })
    }
  } catch (e) {
    console.warn('[Vault Theme] Init error:', e)
  }
}

/**
 * Persist theme preference into self-developed encrypted vault
 */
async function persistEncryptedTheme(dark: boolean, isAuto: boolean = false) {
  if (typeof window === 'undefined') return
  isEncrypting.value = true

  try {
    const rawData = JSON.stringify({
      mode: dark ? 'dark' : 'light',
      preset: dark ? 'film-dark' : 'warm-linen',
      isAuto,
      deviceDark: systemPrefersDark.value,
      timestamp: Date.now(),
      deviceFingerprint: getMachineFingerprint(),
      cipherEngine: 'AES-256-GCM+ECDSA-P521+ZKP'
    })

    // Encrypt using self-developed E2EE suite (AES-256-GCM + NIST ECDSA + HKDF + ZKP)
    const encryptedEnvelope = await encryptE2EE(rawData)
    localStorage.setItem('xo_vault_theme_e2ee', JSON.stringify(encryptedEnvelope))
    localStorage.setItem('xo_theme_preset', dark ? 'film-dark' : 'warm-linen')
    if (isAuto) {
      localStorage.removeItem('xo_theme_user_locked')
    } else {
      localStorage.setItem('xo_theme_user_locked', 'true')
    }

    if (isE2EESupported()) {
      encryptionFingerprint.value = encryptedEnvelope.keyFingerprint
    }

    // Sync encrypted state with server session
    fetch('/api/theme/preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: dark ? 'dark' : 'light',
        isAuto,
        envelope: encryptedEnvelope.signature
      })
    }).catch(() => {})
  } catch (err) {
    console.warn('[Vault Theme] Encrypt error:', err)
    localStorage.setItem('xo_theme_preset', dark ? 'film-dark' : 'warm-linen')
  } finally {
    isEncrypting.value = false
  }
}

/**
 * Reset back to automatic device detection
 */
async function resetToAutoDevice() {
  isAutoDevice.value = true
  const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
  const deviceDark = !!mediaQuery?.matches
  systemPrefersDark.value = deviceDark
  isDark.value = deviceDark
  applyDomTheme(isDark.value)
  await persistEncryptedTheme(isDark.value, true)
}

/**
 * Explicitly set theme mode or toggle back to auto
 */
async function setTheme(mode: 'dark' | 'light' | 'auto') {
  if (mode === 'auto') {
    await resetToAutoDevice()
    return
  }
  isAutoDevice.value = false
  isDark.value = mode === 'dark'
  applyDomTheme(isDark.value)
  await persistEncryptedTheme(isDark.value, false)
}

/**
 * Toggle theme between dark, light or reset to device auto
 */
async function toggleTheme() {
  isAutoDevice.value = false
  isDark.value = !isDark.value
  applyDomTheme(isDark.value)
  await persistEncryptedTheme(isDark.value, false)
}

export function useThemeMode() {
  return {
    isDark,
    isAutoDevice,
    systemPrefersDark,
    currentTheme,
    isInitialized,
    isEncrypting,
    encryptionFingerprint,
    securityLevel,
    initTheme,
    toggleTheme,
    setTheme,
    resetToAutoDevice
  }
}
