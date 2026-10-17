<template>
  <Teleport to="body">
    <Transition name="contact-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#0e1017]/95 border border-amber-500/35 shadow-[0_25px_70px_rgba(0,0,0,0.7)] text-slate-100 overflow-hidden transform transition-all duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <!-- Top Warm Gold Laser Line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          <!-- Background Ambient Glow -->
          <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <!-- Header -->
          <div class="flex items-start justify-between pb-4 border-b border-white/10 relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm flex-shrink-0">
                <IconSax name="sms" :size="20" />
              </div>
              <div>
                <h3 id="contact-modal-title" class="font-bold text-base sm:text-lg text-white font-display tracking-tight flex items-center gap-2">
                  <span>联系与商务合作</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    在线
                  </span>
                </h3>
                <p class="text-[11px] font-sans text-slate-400 font-medium mt-0.5">
                  商务洽谈 · 项目约档 · 商业剪辑 · 调色指导
                </p>
              </div>
            </div>

            <!-- Close Button -->
            <button
              type="button"
              @click="close"
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0 -mr-1"
              title="关闭 (ESC)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Middle: High-Tech Email Address Display Capsule -->
          <div class="my-6 space-y-2 relative z-10">
            <span class="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              官方直联电子邮箱
            </span>
            <div class="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 group">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <div class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
                <span class="font-mono text-sm sm:text-base font-bold text-amber-200 tracking-wide truncate select-all">
                  {{ contactEmail }}
                </span>
              </div>
              <span class="text-[10px] font-mono text-slate-400 flex-shrink-0 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                24h 必复
              </span>
            </div>
          </div>

          <!-- Actions: Two Distinct Options -->
          <div class="space-y-3 relative z-10">
            <!-- Option 1: 复制邮箱地址 -->
            <button
              type="button"
              @click="handleCopyEmail"
              :class="[
                'w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg cursor-pointer active:scale-[0.98]',
                copied
                  ? 'bg-emerald-600 text-white shadow-[0_8px_25px_rgba(16,185,129,0.4)] border border-emerald-400/50'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-amber-400/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
              ]"
            >
              <template v-if="copied">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-emerald-200 animate-bounce">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>已成功复制邮箱地址！</span>
              </template>
              <template v-else>
                <IconSax name="copy" :size="16" class="text-amber-400" />
                <span>复制邮箱地址</span>
              </template>
            </button>

            <!-- Option 2: 一键跳转邮箱客户端发送 -->
            <button
              type="button"
              @click="handleOpenMailto"
              class="w-full py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 shadow-[0_8px_28px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_36px_rgba(245,158,11,0.5)] transition-all duration-300 cursor-pointer active:scale-[0.98] group"
            >
              <IconSax name="direct-right" :size="16" class="transition-transform duration-300 group-hover:translate-x-1" />
              <span>一键跳转邮箱发送</span>
              <span class="font-mono text-xs opacity-70">↗</span>
            </button>
          </div>

          <!-- Bottom Footer Note -->
          <div class="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
            <span>Xo Studio · 影视后期全流程</span>
            <button
              type="button"
              @click="close"
              class="hover:text-slate-200 transition-colors cursor-pointer text-[10px]"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { resolveSafeEmail } from '../utils/email-armor'

const { isOpen, close } = useContactModal()

const siteConfigGlobal = useNuxtData('site-config-global')
const { data: siteConfig } = useFetch<any>('/api/site-config', { lazy: true })

const contactEmail = computed(() => {
  return resolveSafeEmail(siteConfig.value?.siteInfo || siteConfigGlobal.data.value?.siteInfo)
})

const copied = ref(false)
let copyTimer: any = null

const handleCopyEmail = async () => {
  const email = contactEmail.value
  if (!email || !import.meta.client) return

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(email)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = email
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2200)
  } catch {
    copied.value = false
  }
}

const handleOpenMailto = () => {
  const email = contactEmail.value
  if (!email || !import.meta.client) return
  window.location.href = `mailto:${email}`
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeyDown)
  }
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<style scoped>
.contact-modal-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.contact-modal-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.7, 0, 0.84, 0);
}
.contact-modal-enter-from {
  opacity: 0;
}
.contact-modal-leave-to {
  opacity: 0;
}
.contact-modal-enter-from > div {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}
.contact-modal-leave-to > div {
  transform: scale(0.94) translateY(8px);
  opacity: 0;
}
</style>
