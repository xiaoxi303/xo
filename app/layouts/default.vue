<template>
  <div>
    <!-- Floating Announcement Banner (Bottom-Left Premium Capsule) -->
    <Transition name="slide-up">
      <div
        v-if="announcement?.enabled && announcement?.text && showBanner"
        class="fixed bottom-6 left-6 z-[60] max-w-sm rounded-2xl p-4 shadow-[0_12px_40px_rgba(80,60,30,0.12)] border flex items-start gap-3.5 transition-all duration-500 backdrop-blur-xl"
        style="background: rgba(252, 248, 242, 0.92); border-color: rgba(200, 185, 160, 0.35);"
      >
        <!-- Pulse Indicator Dot -->
        <span class="flex h-2 w-2 mt-1.5 relative flex-shrink-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: var(--color-brand-accent)"></span>
          <span class="relative inline-flex rounded-full h-2 w-2" style="background-color: var(--color-brand-accent)"></span>
        </span>

        <!-- Content -->
        <div class="flex-1 space-y-1.5 pr-2">
          <div class="flex items-center gap-1.5">
            <span class="text-[9px] font-bold tracking-widest font-mono uppercase" style="color: var(--color-brand-accent)">
              {{ announcement.badge || 'BROADCAST' }}
            </span>
          </div>
          <p class="text-xs font-semibold leading-relaxed" style="color: var(--color-ink-1)">
            {{ announcement.text }}
          </p>
          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="inline-block text-[10px] font-bold hover:opacity-80 transition-opacity underline"
            style="color: var(--color-brand-accent)"
          >
            查看详情 &rarr;
          </a>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          @click="showBanner = false"
          class="text-black/30 hover:text-black/70 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Premium Warm Atmosphere Background -->
    <div v-if="showOrbs" class="bg-orbs">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
      <div class="bg-orb bg-orb-4" />
    </div>

    <!-- Navbar -->
    <AppNavbar />

    <!-- Page content -->
    <main class="relative z-10">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { data: initialSiteConfig } = await useFetch<any>('/api/site-config')
const siteConfig = useState<any>('site-config', () => initialSiteConfig.value)

watch(initialSiteConfig, (val) => {
  if (val && !siteConfig.value) siteConfig.value = val
}, { immediate: true })

const showBanner = ref(true)

// Dynamic accent color presets mapping
const accentColors = {
  bronze: { primary: '#b45309', primaryRgb: '180, 83, 9', hover: '#92400e' },
  emerald: { primary: '#059669', primaryRgb: '5, 150, 105', hover: '#047857' },
  blue: { primary: '#2563eb', primaryRgb: '37, 99, 235', hover: '#1d4ed8' },
  violet: { primary: '#7c3aed', primaryRgb: '124, 58, 237', hover: '#6d28d9' },
  slate: { primary: '#27272a', primaryRgb: '39, 39, 42', hover: '#18181b' }
}

const showOrbs = computed(() => siteConfig.value?.theme?.showOrbs ?? true)
const showFilmGrain = computed(() => siteConfig.value?.theme?.showFilmGrain ?? true)
const announcement = computed(() => siteConfig.value?.announcement)

const preset = computed(() => siteConfig.value?.theme?.accentPreset || 'bronze')

watch(preset, (val) => {
  const ac = accentColors[val as keyof typeof accentColors] || accentColors.bronze
  if (import.meta.client) {
    const root = document.documentElement
    root.style.setProperty('--color-brand-accent', ac.primary)
    root.style.setProperty('--color-brand-accent-rgb', ac.primaryRgb)
    root.style.setProperty('--color-brand-accent-hover', ac.hover)
  }
}, { immediate: true })

useHead(() => {
  const p = preset.value
  const ac = accentColors[p as keyof typeof accentColors] || accentColors.bronze
  return {
    htmlAttrs: {
      style: `--color-brand-accent: ${ac.primary}; --color-brand-accent-rgb: ${ac.primaryRgb}; --color-brand-accent-hover: ${ac.hover};`
    }
  }
})

watch(showFilmGrain, (val) => {
  if (import.meta.client) {
    if (!val) document.body.classList.add('no-grain')
    else document.body.classList.remove('no-grain')
  }
}, { immediate: true })
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.95);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
</style>
