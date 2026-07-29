<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 select-none border',
      variantClasses
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotClasses]" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'inactive' | 'published' | 'draft' | 'subtle'
  dot?: boolean
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-[#007AFF] text-white border-transparent shadow-[0_2px_10px_rgba(0,122,255,0.3)]'
    case 'published':
      return 'bg-[#34C759]/15 text-[#248a3d] dark:text-[#34C759] border-[#34C759]/30 font-bold'
    case 'draft':
      return 'bg-[#FFCC00]/20 text-[#a37f00] dark:text-[#ffd633] border-[#FFCC00]/40 font-bold'
    case 'subtle':
      return 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 shadow-xs'
    case 'inactive':
    default:
      return 'bg-[#F8F8F8] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200/50'
  }
})

const dotClasses = computed(() => {
  switch (props.variant) {
    case 'published':
      return 'bg-[#34C759] animate-pulse'
    case 'draft':
      return 'bg-[#FFCC00]'
    case 'primary':
      return 'bg-white'
    default:
      return 'bg-slate-400'
  }
})
</script>
