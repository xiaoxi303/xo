<template>
  <div>
    <AppPreloader v-if="!preloaderDone && !isPanelPage" @complete="onPreloaderComplete" @reveal-start="onPreloaderRevealStart" />
    <!-- 1. Top Sticky Bar Announcement (顶部置顶模式) -->
    <Transition name="banner-top">
      <div
        v-if="announcement?.enabled && announcement?.text && showBanner && announcement?.position === 'top-bar' && !isPanelPage"
        class="fixed top-0 inset-x-0 z-[100] py-2 px-4 shadow-md border-b flex items-center justify-between text-xs font-sans backdrop-blur-md transition-all"
        :class="getTopBarBgClass(announcement?.badgeColor)"
      >
        <div class="max-w-6xl mx-auto flex-1 flex items-center justify-center gap-3 overflow-hidden px-2">
          <!-- Badge -->
          <span class="text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full tracking-wider border flex-shrink-0 relative overflow-hidden" :class="getBadgeClass(announcement?.badgeColor)">
            <span class="animate-pulse absolute inset-0 bg-white/20 rounded-full" />
            {{ announcement.badge || '公告' }}
          </span>

          <!-- Text (marquee or static) -->
          <div class="overflow-hidden relative max-w-full">
            <p :class="announcement.animation === 'marquee' ? 'animate-marquee whitespace-nowrap' : 'line-clamp-1'" class="font-medium text-xs">
              {{ announcement.text }}
            </p>
          </div>

          <!-- Link or Detail -->
          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          >
            {{ announcement.ctaText || '查看详情 →' }}
          </a>
          <button
            v-else
            @click="showAnnouncementDetail = true"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity"
          >
            {{ announcement.ctaText || '查看详情 →' }}
          </button>
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
    <Transition name="banner-capsule">
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
              {{ announcement.badge || '公告' }}
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
          <button
            v-else
            @click="showAnnouncementDetail = true"
            class="inline-block text-[10px] font-bold hover:opacity-80 transition-opacity underline"
            style="color: var(--color-brand-accent)"
          >
            {{ announcement.ctaText || '查看详情 →' }}
          </button>
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

    <!-- Client Portal Floating Icon Action Button (Bottom-Right) -->
    <div
      v-if="!isPanelPage"
      class="fixed bottom-6 right-6 z-[60] group flex items-center justify-center"
    >
      <!-- Hover Tooltip -->
      <div class="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-xl bg-stone-900/90 text-amber-300 text-[11px] font-bold tracking-wide backdrop-blur-md border border-amber-500/30 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{{ clientLoggedIn ? `客户控制中心 (${clientName})` : '客户登录中心' }}</span>
      </div>

      <NuxtLink
        :to="clientLoggedIn ? '/client' : '/login'"
        class="relative w-12 h-12 rounded-full border flex items-center justify-center xo-kinetic-btn backdrop-blur-2xl shadow-[0_10px_30px_rgba(180,120,40,0.18)] hover:shadow-[0_16px_40px_rgba(180,120,40,0.32)] cursor-pointer xo-kinetic-layer"
        style="background: rgba(254, 252, 248, 0.94); border-color: rgba(217, 119, 6, 0.38);"
        :title="clientLoggedIn ? `Hi, ${clientName} - 点击进入控制中心` : '点击登录客户中心'"
      >
        <!-- Indicator Dot -->
        <span class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />

        <!-- Icon -->
        <IconSax v-if="clientLoggedIn" name="crown" :size="22" class="text-amber-700 transition-transform duration-300 group-hover:scale-110" />
        <IconSax v-else name="key" :size="22" class="text-amber-800 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
      </NuxtLink>
    </div>

    <!-- Premium Warm Atmosphere Background -->
    <div v-if="showOrbs" class="bg-orbs">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
      <div class="bg-orb bg-orb-4" />
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

    <!-- Announcement Detail Modal -->
    <Transition name="banner-modal">
      <div v-if="showAnnouncementDetail" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" @click.self="showAnnouncementDetail = false">
        <div class="glass-card p-8 rounded-3xl max-w-lg w-full space-y-6 border-2 border-amber-500/30 bg-white/95 shadow-2xl">
          <div class="flex items-center justify-between border-b pb-4 border-black/10">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📢</span>
              <h3 class="font-bold text-lg text-[#121316]">广播详情</h3>
            </div>
            <button type="button" @click="showAnnouncementDetail = false" class="text-slate-400 hover:text-black font-bold text-xl">✕</button>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold font-mono uppercase px-2 py-0.5 rounded-full" :class="getBadgeClass(announcement?.badgeColor)">
                {{ announcement?.badge || '公告' }}
              </span>
            </div>
            <p class="text-sm text-slate-700 leading-relaxed">{{ announcement?.text }}</p>
          </div>
          <div class="flex justify-end pt-4 border-t border-black/10">
            <button type="button" @click="showAnnouncementDetail = false" class="btn-primary px-6 py-2 text-sm">知道了</button>
          </div>
        </div>
      </div>
    </Transition>
</template>

<script setup lang="ts">
const preloaderDone = useState('xo_preloader_done', () => false)
const preloaderRevealed = useState('xo_preloader_revealed', () => false)

const onPreloaderRevealStart = () => {
  preloaderRevealed.value = true
}

const onPreloaderComplete = () => {
  preloaderDone.value = true
  preloaderRevealed.value = true
  if (import.meta.client) document.body.style.overflow = ''
}

// useState persists across route changes — does NOT reset on navigation
const { data: siteConfigData } = useFetch('/api/site-config', { lazy: true })
const siteConfig = useState('site-config', () => siteConfigData.value || {})

const showAnnouncementDetail = ref(false)
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
  const path = (route.path || '').replace(/^\/|\/$/, '')
  const adminPath = (configuredAdminPath.value || 'admin').replace(/^\/|\/$/, '')
  return path === adminPath || path.startsWith(`${adminPath}/`)
})

const isPanelPage = computed(() => {
  const path = (route.path || '').replace(/^\/|\/$/, '')
  const isClient = path === 'client' || path.startsWith('client/') || path === 'login' || path === 'register'
  const isDelivery = path === 'delivery' || path.startsWith('delivery/')
  return isAdminPage.value || isClient || isDelivery || path === 'xo-watermark' || path.startsWith('xo-watermark/')
})

// Ambient Soundscape Player States & Logic
const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

const musicEnabled = computed(() => siteConfig.value?.music?.enabled ?? true)
const musicUrl = computed(() => siteConfig.value?.music?.url || 'https://assets.mixkit.co/music/preview/mixkit-ambient-dream-12.mp3')
const musicLabel = computed(() => siteConfig.value?.music?.label || '环境音乐')
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

// Always release body overflow on any route change — unconditional to prevent blank page lock
watch(() => route.path, () => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  checkClientSession()
  checkBannerDismissal()
  if (import.meta.client) {
    if (preloaderDone.value || isPanelPage.value) document.body.style.overflow = ''
    else document.body.style.overflow = 'hidden'
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* Top Sticky Bar Announcement Transition (下滑下落/滑升隐退) */
.banner-top-enter-active {
  transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, filter 0.45s ease;
}
.banner-top-leave-active {
  transition: transform 0.45s cubic-bezier(0.7, 0, 0.84, 0), opacity 0.35s ease, filter 0.35s ease;
}
.banner-top-enter-from {
  opacity: 0;
  transform: translateY(-100%) scaleY(0.9);
  filter: blur(8px);
}
.banner-top-leave-to {
  opacity: 0;
  transform: translateY(-100%) scaleY(0.9);
  filter: blur(6px);
}

/* Floating Capsule Announcement Transition (左下角弹射绽放/滑落隐退) */
.banner-capsule-enter-active {
  transition: transform 0.75s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.45s ease, filter 0.45s ease;
}
.banner-capsule-leave-active {
  transition: transform 0.45s cubic-bezier(0.4, 0, 1, 1), opacity 0.35s ease, filter 0.35s ease;
}
.banner-capsule-enter-from {
  opacity: 0;
  transform: translateY(48px) scale(0.82) rotate(-3deg);
  filter: blur(12px);
}
.banner-capsule-leave-to {
  opacity: 0;
  transform: translateY(36px) scale(0.85) rotate(-3deg);
  filter: blur(8px);
}

/* Announcement Detail Modal Transition (中心缩放浮现) */
.banner-modal-enter-active {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, filter 0.4s ease;
}
.banner-modal-leave-active {
  transition: transform 0.35s cubic-bezier(0.7, 0, 0.84, 0), opacity 0.3s ease, filter 0.3s ease;
}
.banner-modal-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(24px);
  filter: blur(10px);
}
.banner-modal-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(16px);
  filter: blur(6px);
}

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
