<template>
  <div class="glass-card p-6 space-y-4">
    <div class="flex items-center justify-between border-b pb-3 border-black/[0.06]">
      <div>
        <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-[#121316]">🎛️ 实时全站主题色彩调色盘</h3>
        <p class="text-[10px] text-slate-400 font-mono mt-0.5">Live Global Color Palette & Editorial Theme Engine</p>
      </div>
      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
        LIVE ENGINE
      </span>
    </div>

    <div class="grid grid-cols-3 gap-3 pt-1">
      <button
        v-for="tp in themePresets"
        :key="tp.id"
        type="button"
        @click="applyTheme(tp, true)"
        :class="[
          'p-3.5 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between h-24 active:scale-95 cursor-pointer',
          activeThemeId === tp.id
            ? 'border-amber-600 bg-amber-500/10 shadow-md ring-2 ring-amber-600/30'
            : 'border-black/[0.08] bg-black/[0.01] hover:bg-black/[0.04]'
        ]"
      >
        <div class="flex justify-between items-center w-full">
          <span class="text-xs font-bold text-[#121316]">{{ tp.name }}</span>
          <span class="w-4 h-4 rounded-full border border-black/15 flex-shrink-0" :style="{ background: tp.accent }" />
        </div>
        <div>
          <span class="text-[9px] font-mono block text-slate-400 uppercase">{{ tp.enName }}</span>
          <span class="text-[9px] font-mono font-bold text-amber-800" v-if="activeThemeId === tp.id">✓ CURRENT ACTIVE</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  siteConfig: any
}>()

const emit = defineEmits(['save', 'toast'])

const activeThemeId = ref('warm-linen')

const themePresets = [
  { 
    id: 'warm-linen', 
    name: '暖亚麻大刊', 
    enName: 'Warm Linen',
    bg: '#fcfcfa', 
    accent: '#b45309', 
    ink: '#121316' 
  },
  { 
    id: 'film-dark', 
    name: '深邃胶片暗黑', 
    enName: 'Deep Film Dark',
    bg: '#101114', 
    accent: '#d97706', 
    ink: '#f0f1f5' 
  },
  { 
    id: 'teal-orange', 
    name: '青橙电影感', 
    enName: 'Teal & Orange',
    bg: '#0b1319', 
    accent: '#f97316', 
    ink: '#e6f1f5' 
  }
]

const applyTheme = (tp: any, isUserClick = false) => {
  activeThemeId.value = tp.id
  if (import.meta.client) {
    localStorage.setItem('xo_theme_preset', tp.id)
    const root = document.documentElement
    root.setAttribute('data-theme', tp.id)
    root.style.setProperty('--bg-primary', tp.bg)
    root.style.setProperty('--accent-color', tp.accent)
    root.style.setProperty('--text-main', tp.ink)
  }

  // Only emit save and toast when explicitly clicked by user, NEVER on initial mount!
  if (isUserClick) {
    if (props.siteConfig) {
      if (!props.siteConfig.theme) props.siteConfig.theme = {}
      props.siteConfig.theme.accentPreset = tp.id
      emit('save')
    }
    emit('toast', `🎛️ 主题已实时切换为【${tp.name}】！`)
  }
}

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('xo_theme_preset') || props.siteConfig?.theme?.accentPreset || 'warm-linen'
    const found = themePresets.find(t => t.id === saved) || themePresets[0]
    applyTheme(found, false) // false = no save emission on mount
  }
})
</script>
