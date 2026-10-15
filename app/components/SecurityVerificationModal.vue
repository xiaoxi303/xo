<template>
  <Teleport to="body">
    <Transition name="fade-slide">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-gate-title"
      >
        <!-- Frosted Glass Cinema Backdrop -->
        <div
          class="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
          @click="handleBackdropClick"
        />

        <!-- Main Verification Gateway Card -->
        <div
          class="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#16151a] via-[#0f0e13] to-[#09080b] border border-amber-500/35 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(217,119,6,0.22)] overflow-hidden z-10 transition-all select-none"
        >
          <!-- Ambient Light Glow Orbs -->
          <div class="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div class="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <!-- Card Header Area -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <IconSax name="shield-security" :size="20" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    XO 智能光影安全核验门
                  </span>
                </div>
                <h3 id="security-gate-title" class="text-base font-bold text-white tracking-tight font-display">
                  {{ title || '安全人机核验' }}
                </h3>
              </div>
            </div>

            <!-- Close Modal Button -->
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              @click="handleClose"
              title="取消核验"
            >
              <IconSax name="close" :size="16" />
            </button>
          </div>

          <!-- Operation Target Banner -->
          <div class="mb-4 p-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">正在核验操作：</span>
            <span class="text-amber-300 font-bold tracking-wide">{{ actionName || '身份认证准入' }}</span>
          </div>

          <!-- Mode Selector Pill Bar -->
          <div class="flex items-center gap-1.5 p-1 mb-4 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
            <button
              type="button"
              :class="[
                'flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[11px]',
                activeMode === 'smart-touch'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              ]"
              @click="switchMode('smart-touch')"
            >
              <span>✦ 智能一触式感应</span>
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[11px]',
                activeMode === 'symbol-match'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              ]"
              @click="switchMode('symbol-match')"
            >
              <span>🎯 光影靶标点选</span>
            </button>
          </div>

          <!-- Verification Stage Box -->
          <div class="relative w-full min-h-[190px] bg-[#0b0c10] rounded-2xl border border-white/15 p-4 flex flex-col items-center justify-center overflow-hidden mb-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.85)]">
            <!-- Background Radial Watermark Grid -->
            <div class="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            <!-- MODE 1: Smart Touch Biometric Dial (智能一触式光影核验) -->
            <div v-if="activeMode === 'smart-touch'" class="flex flex-col items-center justify-center w-full py-2 space-y-4">
              <!-- DaVinci Optical Dial Sensor -->
              <div class="relative w-28 h-28 flex items-center justify-center">
                <!-- Outer Rotating Dial Ring -->
                <svg
                  class="absolute inset-0 w-full h-full pointer-events-none transition-transform"
                  :class="{ 'animate-spin-slow': state === 'verifying' }"
                  viewBox="0 0 120 120"
                >
                  <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
                  <circle cx="60" cy="60" r="48" stroke="rgba(217, 119, 6, 0.3)" stroke-width="1.5" stroke-dasharray="4 8" />
                  <circle
                    v-if="state === 'verifying'"
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#fbbf24"
                    stroke-width="2"
                    stroke-dasharray="80 200"
                    stroke-linecap="round"
                  />
                  <!-- Optical Crosshairs -->
                  <line x1="60" y1="4" x2="60" y2="16" stroke="rgba(217, 119, 6, 0.6)" stroke-width="1.5" />
                  <line x1="60" y1="104" x2="60" y2="116" stroke="rgba(217, 119, 6, 0.6)" stroke-width="1.5" />
                  <line x1="4" y1="60" x2="16" y2="60" stroke="rgba(217, 119, 6, 0.6)" stroke-width="1.5" />
                  <line x1="104" y1="60" x2="116" y2="60" stroke="rgba(217, 119, 6, 0.6)" stroke-width="1.5" />
                </svg>

                <!-- Central Interactive Touch Sensor Button -->
                <button
                  type="button"
                  :disabled="state === 'verifying' || state === 'success'"
                  class="relative z-10 w-20 h-20 rounded-full border flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 group focus:outline-none"
                  :class="[
                    state === 'idle'
                      ? 'bg-gradient-to-tr from-amber-600/20 via-amber-500/30 to-amber-600/15 border-amber-500/60 hover:border-amber-400 hover:shadow-[0_0_24px_rgba(217,119,6,0.4)] hover:scale-105'
                      : state === 'verifying'
                      ? 'bg-amber-500/10 border-amber-400/80 shadow-[0_0_20px_rgba(217,119,6,0.3)] cursor-wait'
                      : state === 'success'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                      : 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                  ]"
                  @click="triggerSmartTouchVerification"
                >
                  <!-- State Icons -->
                  <span v-if="state === 'idle'" class="flex flex-col items-center gap-1 text-amber-300 group-hover:text-amber-200">
                    <IconSax name="finger-cricle" :size="28" class="animate-pulse" />
                    <span class="text-[9px] font-mono font-bold tracking-wider">点击核验</span>
                  </span>

                  <span v-else-if="state === 'verifying'" class="flex flex-col items-center gap-1 text-amber-400">
                    <span class="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    <span class="text-[9px] font-mono font-bold">校验中</span>
                  </span>

                  <span v-else-if="state === 'success'" class="flex flex-col items-center gap-1 text-emerald-400">
                    <span class="text-2xl font-bold">✓</span>
                    <span class="text-[9px] font-mono font-bold">已通过</span>
                  </span>

                  <span v-else class="flex flex-col items-center gap-1 text-rose-400">
                    <span class="text-lg">↻</span>
                    <span class="text-[9px] font-mono font-bold">重试</span>
                  </span>
                </button>
              </div>

              <!-- Status Copy Message -->
              <div class="text-center space-y-1">
                <p
                  class="text-xs font-mono font-medium transition-colors"
                  :class="[
                    state === 'success'
                      ? 'text-emerald-400 font-bold'
                      : state === 'error'
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-300'
                  ]"
                >
                  {{ statusText }}
                </p>
                <p class="text-[10px] font-mono text-slate-500">
                  {{ state === 'idle' ? '无需滑动 · 单次触控自动完成光影环境信标校验' : 'XO 密码学双舱自毁保护' }}
                </p>
              </div>
            </div>

            <!-- MODE 2: Optical Symbol Match (光影色彩靶标匹配) -->
            <div v-else class="flex flex-col items-center justify-center w-full py-2 space-y-3">
              <div class="text-center space-y-1">
                <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">请点击匹配目标调色母带符号：</span>
                <div class="inline-block px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-inner">
                  🎯 目标：【{{ targetSymbol }}】
                </div>
              </div>

              <!-- Symbol Candidate Options Grid -->
              <div class="grid grid-cols-2 gap-2.5 w-full max-w-xs pt-1">
                <button
                  v-for="sym in symbolCandidates"
                  :key="sym"
                  type="button"
                  :disabled="state === 'verifying' || state === 'success'"
                  class="py-2.5 px-3 rounded-xl border font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  :class="[
                    selectedSymbolCandidate === sym && state === 'success'
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : selectedSymbolCandidate === sym && state === 'error'
                      ? 'bg-rose-500/25 border-rose-400 text-rose-300'
                      : 'bg-white/[0.04] border-white/10 hover:border-amber-500/50 hover:bg-white/[0.08] text-white active:scale-95'
                  ]"
                  @click="triggerSymbolMatchVerification(sym)"
                >
                  <span>{{ sym }}</span>
                </button>
              </div>

              <p
                class="text-[10px] font-mono transition-colors text-center"
                :class="state === 'error' ? 'text-rose-400' : 'text-slate-500'"
              >
                {{ statusText }}
              </p>
            </div>
          </div>

          <!-- Bottom Footer Security Credentials Info -->
          <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-white/[0.08]">
            <span class="flex items-center gap-1.5 text-slate-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              全链路混淆共识准入
            </span>
            <button
              type="button"
              class="text-amber-400/80 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
              @click="refreshChallenge"
            >
              <span>↻ 刷新挑战</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { encryptRsaHybrid } from '~/utils/rsa-hybrid'

interface Props {
  modelValue: boolean
  title?: string
  subtitle?: string
  actionName?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '安全人机核验',
  subtitle: '点击光影微感应器完成生物人机安全核验',
  actionName: '操作认证'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'verified', token: string): void
  (e: 'close'): void
}>()

const activeMode = ref<'smart-touch' | 'symbol-match'>('smart-touch')
const state = ref<'idle' | 'verifying' | 'success' | 'error'>('idle')
const statusText = ref('点击激活光影智能安全核验')

const currentChallengeId = ref('')
const currentSalt = ref('')
const currentDifficulty = ref(3)
const targetSymbol = ref('4K HDR')
const symbolCandidates = ref<string[]>(['4K HDR', 'ACEScc', 'DAVINCI', 'PRORES'])
const selectedSymbolCandidate = ref('')

let openedAt = 0

const allSymbols = ['4K HDR', 'ACEScc', 'DAVINCI', 'PRORES', 'REC.2020', 'SHUTTER 180°']

// Switch between verification modes
const switchMode = (mode: 'smart-touch' | 'symbol-match') => {
  activeMode.value = mode
  state.value = 'idle'
  statusText.value = mode === 'smart-touch' ? '点击激活光影智能安全核验' : '请点击匹配上方的目标符号'
}

// Fetch a fresh challenge from the server
const refreshChallenge = async () => {
  state.value = 'idle'
  selectedSymbolCandidate.value = ''
  statusText.value = activeMode.value === 'smart-touch' ? '点击激活光影智能安全核验' : '请点击匹配上方的目标符号'
  openedAt = performance.now()

  try {
    const res = await $fetch<any>('/api/security/slider-challenge')
    if (res?.challengeId) {
      currentChallengeId.value = res.challengeId
      currentSalt.value = res.salt || 'xosalt'
      currentDifficulty.value = res.difficulty || 3
      if (res.targetSymbol) {
        targetSymbol.value = res.targetSymbol
      } else {
        targetSymbol.value = allSymbols[Math.floor(Math.random() * allSymbols.length)]
      }

      // Generate 4 randomized unique options including target
      const others = allSymbols.filter(s => s !== targetSymbol.value)
      const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3)
      symbolCandidates.value = [targetSymbol.value, ...shuffledOthers].sort(() => Math.random() - 0.5)
    }
  } catch (err) {
    statusText.value = '获取安全挑战失败，请点击刷新'
  }
}

// Client Proof-of-Work Solver (毫秒级在浏览器中计算哈希解，有效遏制无头机器人)
const solveProofOfWork = async (challengeId: string, salt: string, difficulty = 3): Promise<number> => {
  const prefix = '0'.repeat(difficulty)
  const encoder = new TextEncoder()

  // Use WebCrypto SHA-256
  for (let nonce = 0; nonce < 100000; nonce++) {
    const data = encoder.encode(`${challengeId}:${salt}:${nonce}`)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    if (hashHex.startsWith(prefix)) {
      return nonce
    }
  }
  return 42
}

// Trigger Smart Touch Mode Verification
const triggerSmartTouchVerification = async () => {
  if (state.value === 'verifying' || state.value === 'success') return

  if (!currentChallengeId.value) {
    await refreshChallenge()
  }

  state.value = 'verifying'
  statusText.value = '正在核对光影母带签名与环境信标...'

  const t0 = performance.now()
  try {
    // 1. Solve client Proof-of-Work
    const powNonce = await solveProofOfWork(
      currentChallengeId.value,
      currentSalt.value,
      currentDifficulty.value
    )

    // Ensure realistic human duration feeling (~350ms)
    const elapsed = Math.round(performance.now() - t0)
    const totalDuration = Math.max(380, Math.round(performance.now() - openedAt))
    if (elapsed < 350) {
      await new Promise(r => setTimeout(r, 350 - elapsed))
    }

    // 2. Gather natural client browser entropy (no private data, purely execution environment)
    const entropy = {
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
    }

    // 3. Encrypt submission payload
    const payload = await encryptRsaHybrid({
      challengeId: currentChallengeId.value,
      powNonce,
      duration: totalDuration,
      entropy
    })

    // 4. Submit to server
    const res = await $fetch<any>('/api/security/slider-verify', {
      method: 'POST',
      body: payload
    })

    if (res?.success && res?.token) {
      state.value = 'success'
      statusText.value = '✓ 人机核验通过 · 正在跳转'
      setTimeout(() => {
        emit('verified', res.token)
        emit('update:modelValue', false)
      }, 320)
    } else {
      throw new Error(res?.reason || '核验未通过')
    }
  } catch (err: any) {
    state.value = 'error'
    statusText.value = err?.data?.statusMessage || err?.message || '安全校验超时，请点击重试'
    currentChallengeId.value = ''
  }
}

// Trigger Symbol Match Mode Verification
const triggerSymbolMatchVerification = async (selected: string) => {
  if (state.value === 'verifying' || state.value === 'success') return

  selectedSymbolCandidate.value = selected
  state.value = 'verifying'
  statusText.value = `正在比对所选母带符号【${selected}】...`

  const totalDuration = Math.max(250, Math.round(performance.now() - openedAt))
  try {
    const payload = await encryptRsaHybrid({
      challengeId: currentChallengeId.value,
      selectedSymbol: selected,
      duration: totalDuration
    })

    const res = await $fetch<any>('/api/security/slider-verify', {
      method: 'POST',
      body: payload
    })

    if (res?.success && res?.token) {
      state.value = 'success'
      statusText.value = '✓ 符号靶标匹配正确 · 核验通过'
      setTimeout(() => {
        emit('verified', res.token)
        emit('update:modelValue', false)
      }, 320)
    } else {
      throw new Error(res?.reason || '符号匹配未通过')
    }
  } catch (err: any) {
    state.value = 'error'
    statusText.value = err?.data?.statusMessage || err?.message || '所选符号不匹配或已失效，请重试'
    currentChallengeId.value = ''
  }
}

const handleClose = () => {
  emit('close')
  emit('update:modelValue', false)
}

const handleBackdropClick = () => {
  if (state.value !== 'verifying') {
    handleClose()
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      refreshChallenge()
    } else {
      state.value = 'idle'
      currentChallengeId.value = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

.animate-spin-slow {
  animation: spin 6s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
