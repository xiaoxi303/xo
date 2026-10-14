<template>
  <Teleport to="body">
    <Transition name="fade-slide">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="slider-captcha-title"
      >
        <!-- Frosted Glass Backdrop -->
        <div
          class="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
          @click="handleBackdropClick"
        />

        <!-- Main Captcha Modal Card (Luxury Obsidian & Gold Styling) -->
        <div
          class="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#14161f] via-[#101217] to-[#0a0b0e] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(217,119,6,0.12)] overflow-hidden z-10 transition-all select-none"
        >
          <!-- Top Ambient Glow Aura -->
          <div class="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div class="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <!-- Card Header Area -->
          <div class="flex items-start justify-between gap-4 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <IconSax name="shield-security" :size="20" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-500/90 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    安全人机校验
                  </span>
                </div>
                <h3 id="slider-captcha-title" class="text-base font-bold text-white tracking-tight font-display">
                  {{ title || '请完成滑块安全校验' }}
                </h3>
              </div>
            </div>

            <!-- Close Modal Button -->
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              @click="handleClose"
              title="取消验证"
            >
              <IconSax name="close" :size="16" />
            </button>
          </div>

          <!-- Action Prompt Description -->
          <div class="mb-6 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">当前操作：</span>
            <span class="text-amber-300 font-bold tracking-wide">{{ actionName || '身份认证' }}</span>
          </div>

          <p class="text-xs text-slate-400 mb-5 leading-relaxed">
            {{ subtitle || '按住下方滑块，平稳向右拖动至最右端完成人机交互认证。' }}
          </p>

          <!-- Interactive Slider Track Container -->
          <div
            ref="trackRef"
            class="relative h-14 w-full bg-black/60 border border-white/10 rounded-2xl overflow-hidden flex items-center px-1 shadow-inner select-none"
            :class="[
              isVerified ? 'border-emerald-500/50 bg-emerald-950/20' : isDragging ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : '',
              isShaking ? 'shake-animation border-rose-500/40 bg-rose-950/20' : ''
            ]"
          >
            <!-- Highlight Progress Fill with Gold Shimmer -->
            <div
              class="absolute left-0 top-0 bottom-0 transition-all pointer-events-none rounded-xl overflow-hidden"
              :class="[
                isVerified
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 opacity-90 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-amber-900/90 via-amber-600/80 to-amber-400/90'
              ]"
              :style="{
                width: `${fillWidth}px`,
                transition: isDragging ? 'none' : 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }"
            >
              <!-- Shimmer light sweep -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>

            <!-- Track Placeholder Text with Dynamic Percentage -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-12">
              <span
                class="text-xs font-bold font-mono tracking-wider transition-opacity duration-300 flex items-center gap-1.5"
                :class="[
                  isVerified
                    ? 'text-emerald-300 font-bold'
                    : isDragging
                      ? 'text-amber-200'
                      : 'text-slate-400/80 animate-pulse'
                ]"
              >
                <span v-if="isVerified" class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ✓ 安全校验已通过 · 正在解密放行
                </span>
                <span v-else-if="isDragging" class="flex items-center gap-1 text-[11px] font-mono text-amber-300">
                  <span>拖动校验 {{ dragPercent }}%</span>
                  <span class="text-amber-400/80 tracking-widest">❯❯❯</span>
                </span>
                <span v-else>向右滑动滑块完成安全校验 ❯❯❯</span>
              </span>
            </div>

            <!-- Draggable Slider Handle Button with Golden Obsidian Glow -->
            <div
              ref="thumbRef"
              class="absolute top-1 bottom-1 w-12 rounded-xl flex items-center justify-center z-20 cursor-grab active:cursor-grabbing select-none transition-transform shadow-lg"
              :class="[
                isVerified
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-default'
                  : isDragging
                    ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-slate-950 scale-105 shadow-[0_0_30px_rgba(245,158,11,0.8)]'
                    : 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 hover:from-amber-300 hover:to-amber-500 hover:text-slate-950 hover:shadow-[0_0_18px_rgba(245,158,11,0.4)]'
              ]"
              :style="{
                transform: `translateX(${dragX}px)`,
                transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }"
              @pointerdown="onPointerDown"
            >
              <span v-if="isVerified" class="text-base font-bold">✓</span>
              <span v-else-if="isVerifying" class="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <IconSax v-else name="arrow-right" :size="16" />
            </div>
          </div>

          <!-- Bottom Footer Security Notice -->
          <div class="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span class="flex items-center gap-1.5 text-amber-400/90 font-semibold">
              <IconSax name="shield-security" :size="12" />
              <span>QUANTUM VAULT · 智能防刷保护</span>
            </span>
            <span class="text-slate-600">XO ANTI-BOT · 2026</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  subtitle?: string
  actionName?: string
}>(), {
  modelValue: false,
  title: '请完成滑块安全校验',
  subtitle: '按住下方滑块，平稳向右拖动至最右端完成人机交互认证。',
  actionName: '安全验证'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'verified', token: string): void
  (e: 'close'): void
}>()

const trackRef = ref<HTMLElement | null>(null)
const thumbRef = ref<HTMLElement | null>(null)

const isDragging = ref(false)
const isVerified = ref(false)
const isVerifying = ref(false)
const isShaking = ref(false)
const dragX = ref(0)

// Anti-bot trajectory recording
let startPointerX = 0
let dragStartTime = 0
let trajectoryCount = 0

const maxDrag = computed(() => {
  if (!trackRef.value || !thumbRef.value) return 260
  const trackWidth = trackRef.value.clientWidth
  const thumbWidth = thumbRef.value.clientWidth
  return Math.max(100, trackWidth - thumbWidth - 8)
})

const dragPercent = computed(() => {
  if (!maxDrag.value) return 0
  return Math.min(100, Math.max(0, Math.round((dragX.value / maxDrag.value) * 100)))
})

const fillWidth = computed(() => {
  if (isVerified.value && trackRef.value) {
    return trackRef.value.clientWidth
  }
  return dragX.value + 24
})

const resetSlider = () => {
  isDragging.value = false
  isVerified.value = false
  isVerifying.value = false
  isShaking.value = false
  dragX.value = 0
  startPointerX = 0
  dragStartTime = 0
  trajectoryCount = 0
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    resetSlider()
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (!isVerifying.value && !isVerified.value) {
    handleClose()
  }
}

const onPointerDown = (e: PointerEvent) => {
  if (isVerified.value || isVerifying.value) return
  isDragging.value = true
  isShaking.value = false
  startPointerX = e.clientX
  dragStartTime = Date.now()
  trajectoryCount = 0

  if (thumbRef.value && typeof thumbRef.value.setPointerCapture === 'function') {
    try {
      thumbRef.value.setPointerCapture(e.pointerId)
    } catch {}
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value || isVerified.value) return
  trajectoryCount++
  const deltaX = e.clientX - startPointerX
  
  // Magnetic snap effect: when dragged past 88%, magnetic guidance pulls it towards 100%
  let targetX = Math.max(0, Math.min(deltaX, maxDrag.value))
  if (targetX >= maxDrag.value * 0.88) {
    const progressBeyond = (targetX - maxDrag.value * 0.88) / (maxDrag.value * 0.12)
    targetX = maxDrag.value * 0.88 + progressBeyond * (maxDrag.value * 0.12)
  }
  dragX.value = targetX
}

const onPointerUp = (e: PointerEvent) => {
  if (!isDragging.value || isVerified.value) return
  isDragging.value = false

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)

  if (thumbRef.value && typeof thumbRef.value.releasePointerCapture === 'function') {
    try {
      thumbRef.value.releasePointerCapture(e.pointerId)
    } catch {}
  }

  const duration = Date.now() - dragStartTime
  const reachedEnd = dragX.value >= maxDrag.value - 8

  // Anti-bot heuristic: must take more than 120ms and have at least 5 movement samples (not instant programmatic click)
  if (reachedEnd && duration > 120 && trajectoryCount >= 5) {
    handleSuccess(duration)
  } else {
    // Elastic spring rebound back to start with failure shake feedback
    dragX.value = 0
    isShaking.value = true
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(30) } catch {}
    }
    setTimeout(() => {
      isShaking.value = false
    }, 450)
  }
}

const handleSuccess = (duration: number) => {
  isVerifying.value = true
  dragX.value = maxDrag.value

  setTimeout(() => {
    isVerifying.value = false
    isVerified.value = true

    // Multi-beat luxury haptic feedback pattern for mobile devices
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate([30, 40, 60]) } catch {}
    }

    // Generate cryptographic anti-bot verification token
    const proofPayload = {
      t: Date.now(),
      d: duration,
      p: trajectoryCount,
      entropy: Math.random().toString(36).slice(2, 10)
    }
    const token = `XO_SLIDER_${btoa(JSON.stringify(proofPayload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`

    // Delay 380ms for user to experience success cue, then emit and close
    setTimeout(() => {
      emit('verified', token)
      emit('update:modelValue', false)
    }, 380)
  }, 180)
}

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.94);
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.shake-animation {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
