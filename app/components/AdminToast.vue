<template>
  <div class="fixed top-6 right-6 z-[9999999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full select-none">
    <TransitionGroup name="toast-list">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto p-4 rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.15)] border backdrop-blur-2xl flex items-start gap-3 transition-all duration-300 relative overflow-hidden group cursor-pointer"
        :class="getToastClass(t.type)"
        @click="removeToast(t.id)"
      >
        <!-- Icon -->
        <span class="text-base flex-shrink-0 mt-0.5">
          <span v-if="t.type === 'success'">✨</span>
          <span v-else-if="t.type === 'error'">⚠️</span>
          <span v-else-if="t.type === 'loading'">⏳</span>
          <span v-else>💡</span>
        </span>

        <!-- Content -->
        <div class="flex-1 space-y-0.5 pr-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase font-bold tracking-wider opacity-70">
              {{ t.type === 'success' ? 'SYSTEM SUCCESS' : (t.type === 'error' ? 'ALERT ERROR' : 'NOTIFICATION') }}
            </span>
          </div>
          <p class="text-xs font-semibold leading-relaxed">
            {{ t.message }}
          </p>
        </div>

        <!-- Close button -->
        <button
          type="button"
          @click.stop="removeToast(t.id)"
          class="opacity-40 hover:opacity-100 transition-opacity p-0.5 text-xs flex-shrink-0"
        >
          ✕
        </button>

        <!-- Progress bar line -->
        <div
          class="absolute bottom-0 left-0 h-[2.5px] bg-current opacity-30 transition-all"
          :style="{ width: `${t.progress}%` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'loading'
  duration: number
  progress: number
}

const props = defineProps<{
  toasts: ToastItem[]
}>()

const emit = defineEmits(['close'])

const removeToast = (id: string) => {
  emit('close', id)
}

const getToastClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-amber-950/90 text-amber-100 border-amber-600/40 ring-1 ring-amber-500/20'
    case 'error':
      return 'bg-rose-950/90 text-rose-100 border-rose-600/40 ring-1 ring-rose-500/20'
    case 'loading':
      return 'bg-slate-900/90 text-slate-100 border-slate-700/40 ring-1 ring-slate-600/20'
    default:
      return 'bg-stone-900/90 text-stone-100 border-stone-700/40'
  }
}
</script>

<style scoped>
.toast-list-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.toast-list-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.9);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}
</style>
