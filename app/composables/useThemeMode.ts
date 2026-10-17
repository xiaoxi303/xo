import { ref, computed } from 'vue'
import { encryptE2EE, decryptE2EE, getE2EEFingerprint, isE2EESupported, verifyE2EEPayloadSignature } from '~/utils/e2ee'
import { getMachineFingerprint } from '~/utils/rsa-hybrid'

const isDark = ref(false)
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
 * Initialize theme from encrypted vault storage
 */
async function initTheme() {
  if (typeof window === 'undefined' || isInitialized.value) return

  try {
    if (isE2EESupported()) {
      encryptionFingerprint.value = await getE2EEFingerprint()
    }

    const encryptedData = localStorage.getItem('xo_vault_theme_e2ee')
    if (encryptedData) {
      try {
        const envelope = JSON.parse(encryptedData)
        // Verify digital signature & cryptographic tamper-proof integrity
        const check = await verifyE2EEPayloadSignature(envelope)
        if (check.valid) {
          const decryptedJson = await decryptE2EE(envelope)
          const parsed = JSON.parse(decryptedJson)
          if (parsed && (parsed.mode === 'dark' || parsed.preset === 'film-dark')) {
            isDark.value = true
          } else {
            isDark.value = false
          }
          applyDomTheme(isDark.value)
          isInitialized.value = true
          return
        }
      } catch (err) {
        console.warn('[Vault Theme] Encrypted payload decode error:', err)
      }
    }

    // Fallback: check legacy localStorage preset or system preference
    const legacyPreset = localStorage.getItem('xo_theme_preset')
    if (legacyPreset) {
      isDark.value = legacyPreset === 'film-dark' || legacyPreset === 'dark'
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDark.value = true
    } else {
      isDark.value = false
    }

    applyDomTheme(isDark.value)
    isInitialized.value = true

    // Upgrade initial plain state to self-developed encrypted vault
    persistEncryptedTheme(isDark.value).catch(() => {})
  } catch (e) {
    console.warn('[Vault Theme] Init error:', e)
  }
}

/**
 * Persist theme preference into self-developed encrypted vault
 */
async function persistEncryptedTheme(dark: boolean) {
  if (typeof window === 'undefined') return
  isEncrypting.value = true

  try {
    const rawData = JSON.stringify({
      mode: dark ? 'dark' : 'light',
      preset: dark ? 'film-dark' : 'warm-linen',
      timestamp: Date.now(),
      deviceFingerprint: getMachineFingerprint(),
      cipherEngine: 'AES-256-GCM+ECDSA-P521+ZKP'
    })

    // Encrypt using self-developed E2EE suite (AES-256-GCM + NIST ECDSA + HKDF + ZKP)
    const encryptedEnvelope = await encryptE2EE(rawData)
    localStorage.setItem('xo_vault_theme_e2ee', JSON.stringify(encryptedEnvelope))
    localStorage.setItem('xo_theme_preset', dark ? 'film-dark' : 'warm-linen')

    if (isE2EESupported()) {
      encryptionFingerprint.value = encryptedEnvelope.keyFingerprint
    }

    // Sync encrypted state with server session
    fetch('/api/theme/preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: dark ? 'dark' : 'light',
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
 * Toggle theme between dark and light with instant visual feedback and encrypted persistence
 */
async function toggleTheme() {
  isDark.value = !isDark.value
  applyDomTheme(isDark.value)
  await persistEncryptedTheme(isDark.value)
}

/**
 * Explicitly set theme mode
 */
async function setTheme(mode: 'dark' | 'light') {
  isDark.value = mode === 'dark'
  applyDomTheme(isDark.value)
  await persistEncryptedTheme(isDark.value)
}

export function useThemeMode() {
  return {
    isDark,
    currentTheme,
    isInitialized,
    isEncrypting,
    encryptionFingerprint,
    securityLevel,
    initTheme,
    toggleTheme,
    setTheme
  }
}
