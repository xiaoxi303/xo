<template>
  <div>
    <AppPreloader v-if="!preloaderDone && !isPanelPage" @complete="onPreloaderComplete" />

    <!-- 1. Top Sticky Bar Announcement (顶部置顶模式) -->
    <Transition name="fade">
      <div
        v-if="announcement?.enabled && announcement?.text && showBanner && announcement?.position === 'top-bar' && !isPanelPage"
        class="fixed top-0 inset-x-0 z-[100] py-2 px-4 shadow-md border-b flex items-center justify-between text-xs font-sans backdrop-blur-md transition-all"
        :class="getTopBarBgClass(announcement?.badgeColor)"
      >
        <div class="max-w-6xl mx-auto flex-1 flex items-center justify-center gap-3 overflow-hidden px-2">
          <!-- Badge -->
          <span class="text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full tracking-wider border flex-shrink-0" :class="getBadgeClass(announcement?.badgeColor)">
            {{ announcement.badge || 'BROADCAST' }}
          </span>

          <!-- Text (marquee or static) -->
          <div class="overflow-hidden relative max-w-full">
            <p :class="announcement.animation === 'marquee' ? 'animate-marquee whitespace-nowrap' : 'line-clamp-1'" class="font-medium text-xs">
              {{ announcement.text }}
            </p>
          </div>

          <!-- Link -->
          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          >
            {{ announcement.ctaText || '查看详情 →' }}
          </a>
        </div>

        <!-- Close -->
        <button
          type="button"
          @click="dismissBanner"
          class="opacity-60 hover:opacity-100 transition-opacity p-1 ml-2 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- 2. Floating Capsule Announcement (Bottom-Left 胶囊模式) -->
    <Transition name="slide-up">
      <div
        v-if="announcement?.enabled && announcement?.text && showBanner && announcement?.position !== 'top-bar' && !isPanelPage"
        class="fixed bottom-6 left-6 z-[60] max-w-sm rounded-2xl p-4 shadow-[0_12px_40px_rgba(80,60,30,0.12)] border flex items-start gap-3.5 transition-all duration-500 backdrop-blur-xl"
        style="background: rgba(252, 248, 242, 0.94); border-color: rgba(200, 185, 160, 0.35);"
      >
        <!-- Indicator Dot -->
        <span class="flex h-2 w-2 mt-1.5 relative flex-shrink-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: var(--color-brand-accent)"></span>
          <span class="relative inline-flex rounded-full h-2 w-2" style="background-color: var(--color-brand-accent)"></span>
        </span>

        <!-- Content -->
        <div class="flex-1 space-y-1.5 pr-2">
          <div class="flex items-center gap-1.5">
            <span class="text-[9px] font-bold tracking-widest font-mono uppercase px-2 py-0.5 rounded-full border" :class="getBadgeClass(announcement?.badgeColor)">
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
            {{ announcement.ctaText || '查看详情 →' }}
          </a>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          @click="dismissBanner"
          class="text-black/30 hover:text-black/70 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Client Portal Floating Pill (Bottom-Right) -->
    <div
      v-if="!isPanelPage"
      class="fixed bottom-6 right-6 z-[50] rounded-full px-4 py-2 border flex items-center gap-2.5 transition-all duration-350 backdrop-blur-xl hover:scale-105 active:scale-95 shadow-md"
      style="background: rgba(252, 248, 242, 0.88); border-color: rgba(200, 185, 160, 0.25);"
    >
      <span class="text-xs">🔑</span>
      <div v-if="clientLoggedIn" class="flex items-center gap-2 text-[10px] font-sans">
        <NuxtLink to="/client" class="font-bold text-slate-700 hover:text-amber-700 transition-colors flex items-center gap-1" title="进入客户中心">
          Hi, {{ clientName }}
          <span class="text-[9px] px-1 bg-amber-600/10 text-amber-700 rounded-sm font-semibold">控制中心</span>
        </NuxtLink>
        <span class="text-slate-300">|</span>
        <button
          type="button"
          @click="handleClientLogout"
          class="font-semibold text-slate-500 hover:text-rose-500 transition-colors hover:underline"
        >
          退出
        </button>
      </div>
      <div v-else class="flex items-center text-[10px] font-sans font-semibold">
        <NuxtLink to="/login" class="text-slate-600 hover:text-amber-700 transition-colors">客户登录</NuxtLink>
      </div>
    </div>

    <!-- Premium Warm Atmosphere Background -->
    <div v-if="showOrbs" class="bg-orbs">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
      <div class="bg-orb bg-orb-4" />
    </div>

    <!-- Floating Ambient Soundscape Player (Bottom-Center dock) -->
    <div
      v-if="musicEnabled && !isPanelPage"
      class="fixed bottom-4 z-[60] rounded-full px-4 py-2.5 shadow-[0_8px_30px_rgba(80,60,30,0.08)] border flex items-center gap-3 transition-all duration-300 backdrop-blur-xl"
      style="left: 50%; transform: translateX(-50%); background: rgba(252, 248, 242, 0.9); border-color: rgba(200, 185, 160, 0.25);"
    >
      <!-- Audio Beat visualizer -->
      <div class="flex items-end gap-[2px] h-3.5 w-4 cursor-pointer" @click="toggleMusic">
        <span
          v-for="bar in 4"
          :key="bar"
          class="w-[2px] bg-[#b45309] rounded-full transition-all duration-300"
          :class="isPlaying ? 'animate-beat-bar' : 'h-[3px]'"
          :style="{ animationDelay: `${bar * 0.15}s` }"
        />
      </div>

      <div class="flex items-center gap-2 cursor-pointer" @click="toggleMusic">
        <span class="text-[10px] font-mono font-bold tracking-wider text-[#b45309] uppercase select-none">
          {{ musicLabel }}
        </span>
        <span class="text-[9px] font-mono text-slate-400">
          {{ isPlaying ? 'PLAYING' : 'PAUSED' }}
        </span>
      </div>

      <audio
        ref="audioRef"
        :src="musicUrl"
        loop
        preload="auto"
      />
    </div>

    <!-- Main Layout Content Slot -->
    <div :class="{'pt-10': announcement?.enabled && announcement?.text && showBanner && announcement?.position === 'top-bar' && !isPanelPage}">
      <AppNavbar v-if="!isPanelPage" />
      <main>
        <slot />
      </main>
      <AppFooter v-if="!isPanelPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
const preloaderDone = ref(false)

const onPreloaderComplete = () => {
  preloaderDone.value = true
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
}

const { data: siteConfigData } = await useFetch('/api/site-config')
const siteConfig = useState('site-config', () => siteConfigData.value)

const showBanner = ref(true)

const dismissBanner = () => {
  showBanner.value = false
  if (import.meta.client) {
    try {
      localStorage.setItem('xo_announcement_dismissed', Date.now().toString())
    } catch (e) {}
  }
}

const checkBannerDismissal = () => {
  if (import.meta.client) {
    try {
      const dismissed = localStorage.getItem('xo_announcement_dismissed')
      if (dismissed) {
        const timestamp = parseInt(dismissed, 10)
        // 24 hours dismissal window
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          showBanner.value = false
        }
      }
    } catch (e) {}
  }
}

const accentColors = {
  bronze: { primary: '#b45309', primaryRgb: '180, 83, 9', hover: '#92400e' },
  gold: { primary: '#d97706', primaryRgb: '217, 119, 6', hover: '#b45309' },
  emerald: { primary: '#059669', primaryRgb: '5, 150, 105', hover: '#047857' },
  slate: { primary: '#27272a', primaryRgb: '39, 39, 42', hover: '#18181b' }
}

const showOrbs = computed(() => siteConfig.value?.theme?.showOrbs ?? true)
const showFilmGrain = computed(() => siteConfig.value?.theme?.showFilmGrain ?? true)
const announcement = computed(() => siteConfig.value?.announcement)
const preset = computed(() => siteConfig.value?.theme?.accentPreset || 'bronze')

const getBadgeClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
    case 'rose': return 'bg-rose-500/10 text-rose-700 border-rose-500/20'
    case 'indigo': return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20'
    default: return 'bg-amber-600/10 text-amber-800 border-amber-600/20'
  }
}

const getTopBarBgClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-950/90 border-emerald-800/40 text-emerald-100'
    case 'rose': return 'bg-rose-950/90 border-rose-800/40 text-rose-100'
    case 'indigo': return 'bg-indigo-950/90 border-indigo-800/40 text-indigo-100'
    default: return 'bg-[#181614]/95 border-amber-900/30 text-amber-100'
  }
}

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

// Hide player and footer/navbar only on actual admin pages
const route = useRoute()
const configuredAdminPath = computed(() => siteConfig.value?.admin?.adminPath || 'admin')

const isAdminPage = computed(() => {
  const path = (route.path || '').replace(/^\/|\/$/g, '')
  const adminPath = (configuredAdminPath.value || 'admin').replace(/^\/|\/$/g, '')
  return path === adminPath || path.startsWith(`${adminPath}/`)
})

const isPanelPage = computed(() => {
  const path = (route.path || '').replace(/^\/|\/$/g, '')
  const isClient = path === 'client' || path.startsWith('client/') || path === 'login' || path === 'register'
  return isAdminPage.value || isClient
})

// Ambient Soundscape Player States & Logic
const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

const musicEnabled = computed(() => siteConfig.value?.music?.enabled ?? true)
const musicUrl = computed(() => siteConfig.value?.music?.url || 'https://assets.mixkit.co/music/preview/mixkit-ambient-dream-12.mp3')
const musicLabel = computed(() => siteConfig.value?.music?.label || 'AMBIENT AUDIO')
const musicVolume = computed(() => siteConfig.value?.music?.volume ?? 70)

watch(musicVolume, (val) => {
  if (audioRef.value) {
    audioRef.value.volume = Math.max(0, Math.min(1, val / 100))
  }
}, { immediate: true })

const toggleMusic = () => {
  if (!audioRef.value) return
  audioRef.value.volume = Math.max(0, Math.min(1, musicVolume.value / 100))
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.warn('Audio playback requires user interaction', err)
    })
  }
}

const clientLoggedIn = ref(false)
const clientName = ref('')

const checkClientSession = async () => {
  try {
    const res = await $fetch<any>('/api/auth/client-me')
    if (res.loggedIn) {
      clientLoggedIn.value = true
      clientName.value = res.username
    } else {
      clientLoggedIn.value = false
    }
  } catch (e) {
    clientLoggedIn.value = false
  }
}

const handleClientLogout = async () => {
  if (!confirm('确认要退出客户账号吗？')) return
  try {
    await $fetch('/api/auth/client-logout', { method: 'POST' })
    clientLoggedIn.value = false
    clientName.value = ''
    const router = useRouter()
    router.push('/')
  } catch (e) {}
}

onMounted(() => {
  checkClientSession()
  checkBannerDismissal()
  if (import.meta.client && !preloaderDone.value && !isPanelPage.value) {
    document.body.style.overflow = 'hidden'
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.animate-marquee {
  display: inline-block;
  animation: marquee 18s linear infinite;
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
