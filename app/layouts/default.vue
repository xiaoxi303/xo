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

    <!-- Floating Ambient Soundscape Player (Bottom-Left, below announcement) -->
    <div
      v-if="musicEnabled && !isAdminPage"
      class="fixed z-[60] rounded-full px-4 py-2.5 shadow-[0_8px_30px_rgba(80,60,30,0.08)] border flex items-center gap-3 transition-all duration-300 backdrop-blur-xl"
      :class="announcement?.enabled && announcement?.text && showBanner ? 'bottom-24 left-6' : 'bottom-6 left-6'"
      style="background: rgba(252, 248, 242, 0.9); border-color: rgba(200, 185, 160, 0.25);"
    >
      <!-- Audio Beat visualizer (dancing bar micro-animation) -->
      <div class="flex items-end gap-[2px] h-3.5 w-4 cursor-pointer" @click="toggleMusic">
        <span
          v-for="bar in 4"
          :key="bar"
          class="w-[2px] bg-[#b45309] rounded-full transition-all duration-300"
          :class="isPlaying ? 'animate-beat-bar' : 'h-[3px]'"
          :style="{
            animationDelay: `${bar * 0.15}s`
          }"
        />
      </div>

      <!-- Music Info -->
      <div class="flex flex-col select-none cursor-pointer" @click="toggleMusic">
        <span class="text-[9px] font-mono font-bold tracking-wider" style="color: var(--color-ink-3)">AMBIENT AUDIO</span>
        <span class="text-[9px] font-bold truncate max-w-[80px]" style="color: var(--color-ink-5)">{{ isPlaying ? '播放中' : '已静音' }}</span>
      </div>

      <!-- Play/Mute Button -->
      <button
        type="button"
        @click="toggleMusic"
        class="w-6 h-6 rounded-full flex items-center justify-center bg-[#b45309]/10 hover:bg-[#b45309]/20 transition-all text-[#b45309]"
      >
        <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
          <path d="M5.75 3a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75A.75.75 0 015.75 3zm5 0a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110.75 3z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.324-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      </button>

      <!-- Hidden Audio element -->
      <audio
        ref="audioRef"
        :src="musicUrl"
        loop
      />
    </div>

    <!-- Navbar — hidden on admin pages -->
    <AppNavbar v-if="!isAdminPage" />

    <!-- Page content -->
    <main class="relative z-10">
      <slot />
    </main>

    <!-- Footer — hidden on admin pages -->
    <AppFooter v-if="!isAdminPage" />
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

// Hide player and footer/navbar on admin pages
const route = useRoute()
const isAdminPage = computed(() => !!route.params.adminSuffix)

// Ambient Soundscape Player States & Logic
const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

const musicEnabled = computed(() => siteConfig.value?.music?.enabled ?? true)
const musicUrl = computed(() => siteConfig.value?.music?.url || 'https://assets.mixkit.co/music/preview/mixkit-ambient-dream-12.mp3')

const toggleMusic = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.warn('Audio playback was prevented, requires user interaction first', err)
    })
  }
}
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

/* Soundscape visualizer beat animation */
@keyframes beat-bar {
  0%, 100% { height: 3px; }
  50% { height: 14px; }
}
.animate-beat-bar {
  animation: beat-bar 0.8s ease-in-out infinite alternate;
}
</style>
