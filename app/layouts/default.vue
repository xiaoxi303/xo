<template>
  <div :style="layoutStyle">
    <!-- Top Announcement Banner -->
    <div
      v-if="announcement?.enabled && announcement?.text"
      class="relative z-[60] w-full flex items-center justify-center py-2.5 px-6 text-xs font-medium text-white transition-all duration-300 shadow-sm"
      style="background: linear-gradient(135deg, var(--color-brand-accent, #b45309), var(--color-brand-accent-hover, #78350f))"
    >
      <div class="max-w-6xl w-full flex items-center justify-between gap-4">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-white/20 uppercase tracking-wider flex-shrink-0 font-mono">
            {{ announcement.badge || 'NOTICE' }}
          </span>
          <span class="truncate">{{ announcement.text }}</span>
        </div>
        <a
          v-if="announcement.link"
          :href="announcement.link"
          class="underline font-bold hover:opacity-90 flex-shrink-0 transition-opacity text-xs"
        >
          查看详情 &rarr;
        </a>
      </div>
    </div>

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
    <main class="relative z-10" :class="{ 'pt-8': announcement?.enabled && announcement?.text }">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { data: siteConfig } = await useFetch<any>('/api/site-config')

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

const layoutStyle = computed(() => {
  const preset = siteConfig.value?.theme?.accentPreset || 'bronze'
  const ac = accentColors[preset as keyof typeof accentColors] || accentColors.bronze
  return {
    '--color-brand-accent': ac.primary,
    '--color-brand-accent-rgb': ac.primaryRgb,
    '--color-brand-accent-hover': ac.hover
  }
})

watch(showFilmGrain, (val) => {
  if (import.meta.client) {
    if (!val) document.body.classList.add('no-grain')
    else document.body.classList.remove('no-grain')
  }
}, { immediate: true })
</script>
