<template>
  <div>
    <AppPreloader v-if="!preloaderDone && !isPanelPage" @complete="onPreloaderComplete" @reveal-start="onPreloaderRevealStart" />
    <!-- 1. Top Sticky Bar Announcement (顶部置顶流光通告条) -->
    <Transition name="banner-top">
      <div
        v-if="isAnnouncementActive && announcement?.position === 'top-bar'"
        class="fixed top-0 inset-x-0 z-[100] py-2 px-4 shadow-[0_4px_24px_rgba(0,0,0,0.18)] border-b flex items-center justify-between text-xs font-sans backdrop-blur-xl transition-all overflow-hidden"
        :class="getTopBarBgClass(announcement?.badgeColor)"
      >
        <!-- Subtle Ambient Shimmer Stream -->
        <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" />

        <div class="max-w-6xl mx-auto flex-1 flex items-center justify-center gap-3 overflow-hidden px-2 relative z-10">
          <!-- Badge -->
          <span
            class="text-[9px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full tracking-wider border flex items-center gap-1.5 flex-shrink-0 shadow-sm relative overflow-hidden"
            :class="getBadgeClass(announcement?.badgeColor)"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{{ announcement.badge || 'NOTICE' }}</span>
          </span>

          <!-- Optional Subtitle -->
          <span v-if="announcement.subtitle" class="hidden sm:inline-block text-[11px] font-mono opacity-60 font-semibold tracking-wide flex-shrink-0">
            {{ announcement.subtitle }} ·
          </span>

          <!-- Text (marquee or static) with Edge Mask Fade -->
          <div class="overflow-hidden relative max-w-full px-2" style="mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);">
            <p :class="announcement.animation === 'marquee' ? 'animate-marquee whitespace-nowrap' : (announcement.animation === 'fade' ? 'animate-fade-soft' : 'line-clamp-1')" class="font-medium text-xs tracking-wide">
              {{ announcement.text }}
            </p>
          </div>

          <!-- Link or Detail CTA Button -->
          <a
            v-if="announcement.link"
            :href="announcement.link"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-all hover:translate-x-0.5"
          >
            <span>{{ announcement.ctaText || '查看详情' }}</span>
            <span class="font-mono text-xs">→</span>
          </a>
          <button
            v-else
            type="button"
            @click="showAnnouncementDetail = true"
            class="text-[11px] font-bold hover:underline flex items-center gap-1 flex-shrink-0 opacity-90 hover:opacity-100 transition-all hover:translate-x-0.5 cursor-pointer"
          >
            <span>{{ announcement.ctaText || '查看详情' }}</span>
            <span class="font-mono text-xs">→</span>
          </button>
        </div>

        <!-- Right Quick Action Controls -->
        <div class="flex items-center gap-1 flex-shrink-0 ml-2 relative z-10">
          <button
            type="button"
            @click="minimizeBanner"
            class="opacity-60 hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-[10px] font-mono cursor-pointer"
            title="最小化收起到角落"
          >
            一
          </button>
          <button
            type="button"
            @click="dismissBanner"
            class="opacity-60 hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
            title="关闭本次广播"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 2. Floating Capsule Announcement (左下角极奢悬浮胶囊模式) -->
    <Transition name="banner-capsule">
      <div
        v-if="isAnnouncementActive && (announcement?.position === 'capsule' || !announcement?.position)"
        class="fixed bottom-6 left-6 z-[60] max-w-[calc(100vw-3rem)] sm:max-w-sm rounded-2xl p-4 shadow-[0_16px_48px_rgba(80,60,30,0.16)] border flex items-start gap-3.5 transition-all duration-500 backdrop-blur-2xl group hover:shadow-[0_20px_56px_rgba(80,60,30,0.22)] hover:-translate-y-0.5"
        style="background: rgba(254, 252, 248, 0.95); border-color: rgba(200, 185, 160, 0.45);"
      >
        <!-- Indicator Ping Dot -->
        <span class="flex h-2.5 w-2.5 mt-1 relative flex-shrink-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="getPingColor(announcement?.badgeColor)" />
          <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="getDotColor(announcement?.badgeColor)" />
        </span>

        <!-- Main Content Body -->
        <div class="flex-1 space-y-1.5 pr-1">
          <div class="flex items-center gap-2">
            <span class="text-[9px] font-bold tracking-widest font-mono uppercase px-2 py-0.5 rounded-full border shadow-xs" :class="getBadgeClass(announcement?.badgeColor)">
              {{ announcement.badge || 'NOTICE' }}
            </span>
            <span v-if="announcement.subtitle" class="text-[10px] font-mono font-medium" style="color: var(--color-ink-4)">
              {{ announcement.subtitle }}
            </span>
          </div>

          <p class="text-xs font-semibold leading-relaxed" style="color: var(--color-ink-1)">
            {{ announcement.text }}
          </p>

          <div class="pt-0.5 flex items-center gap-3">
            <a
              v-if="announcement.link"
              :href="announcement.link"
              class="inline-flex items-center gap-1 text-[11px] font-bold hover:opacity-80 transition-all hover:translate-x-0.5"
              style="color: var(--color-brand-accent)"
            >
              <span>{{ announcement.ctaText || '查看详情' }}</span>
              <span class="font-mono">→</span>
            </a>
            <button
              v-else
              type="button"
              @click="showAnnouncementDetail = true"
              class="inline-flex items-center gap-1 text-[11px] font-bold hover:opacity-80 transition-all hover:translate-x-0.5 cursor-pointer"
              style="color: var(--color-brand-accent)"
            >
              <span>{{ announcement.ctaText || '查看详情' }}</span>
              <span class="font-mono">→</span>
            </button>
          </div>
        </div>

        <!-- Right Close / Minimize Button -->
        <button
          type="button"
          @click="dismissBanner"
          class="text-black/30 hover:text-black/70 hover:bg-black/5 p-1 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
          title="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

    <!-- 3. Popup Modal Mode Announcement (进站首屏震撼弹窗模式) -->
    <Transition name="banner-modal">
      <div
        v-if="isAnnouncementActive && announcement?.position === 'modal'"
        class="fixed inset-0 z-[999998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none"
        @click.self="dismissBanner"
      >
        <div class="glass-card p-8 rounded-3xl max-w-lg w-full space-y-6 border-2 border-amber-500/30 bg-white/95 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />
          <div class="flex items-center justify-between border-b pb-4 border-black/10">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">📢</span>
              <div>
                <span class="text-[10px] font-mono uppercase font-bold tracking-wider opacity-60">ANNOUNCEMENT</span>
                <h3 class="font-bold text-base text-[#121316]">
                  {{ announcement?.subtitle || '重要通知与活动' }}
                </h3>
              </div>
            </div>
            <button type="button" @click="dismissBanner" class="text-slate-400 hover:text-black font-bold text-lg p-1 cursor-pointer">✕</button>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold font-mono uppercase px-2.5 py-0.5 rounded-full" :class="getBadgeClass(announcement?.badgeColor)">
                {{ announcement?.badge || 'NOTICE' }}
              </span>
            </div>
            <p class="text-sm text-slate-800 leading-relaxed font-medium">
              {{ announcement?.text }}
            </p>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-black/10">
            <label class="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" v-model="rememberDismissal" class="rounded accent-amber-600" />
              <span>24小时内不再弹出</span>
            </label>
            <div class="flex gap-2">
              <a
                v-if="announcement.link"
                :href="announcement.link"
                class="btn-primary px-5 py-2 text-xs font-bold"
              >
                {{ announcement.ctaText || '立即前往 →' }}
              </a>
              <button
                type="button"
                @click="dismissBanner"
                class="px-4 py-2 text-xs font-bold rounded-xl border border-black/10 hover:bg-black/5"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 4. Collapsible Persistent Bell (收起后常驻极简晶体小挂件) -->
    <Transition name="fade">
      <div
        v-if="!showBanner && announcement?.enabled && announcement?.text && !isPanelPage"
        class="fixed bottom-6 left-6 z-[59] select-none"
      >
        <button
          type="button"
          @click="showBanner = true"
          class="h-9 px-3.5 rounded-full border border-amber-600/35 bg-[#181614]/90 text-amber-200 text-xs font-bold font-mono tracking-wider backdrop-blur-xl shadow-lg flex items-center gap-2 hover:scale-105 hover:bg-[#181614] hover:border-amber-500/60 transition-all active:scale-95 group cursor-pointer"
          :title="`查看公告: ${announcement.text}`"
        >
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span class="group-hover:translate-x-0.5 transition-transform">📢 {{ announcement.badge || '公告' }}</span>
        </button>
      </div>
    </Transition>

    <!-- Client Portal Floating Icon Action Button (Bottom-Right) -->
    <div
      v-if="!isPanelPage"
      class="fixed bottom-6 right-6 z-[60] group flex items-center justify-center select-none"
    >
      <!-- Soft breathing ambient glow -->
      <span class="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-500/25 to-amber-600/15 blur-md pointer-events-none group-hover:scale-125 transition-transform duration-500 animate-pulse" />

      <!-- Hover Tooltip with Spring Ease -->
      <div class="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-xl bg-stone-900/90 text-amber-300 text-[11px] font-bold tracking-wide backdrop-blur-md border border-amber-500/30 shadow-xl opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.25) pointer-events-none whitespace-nowrap flex items-center gap-1.5">
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

        <!-- Icon with Spring Micro-motion -->
        <IconSax v-if="clientLoggedIn" name="crown" :size="22" class="text-amber-700 transition-transform duration-300 group-hover:scale-115" />
        <IconSax v-else name="key" :size="22" class="text-amber-800 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12" />
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
    <div :class="{'pt-10': isAnnouncementActive && announcement?.position === 'top-bar'}">
      <AppNavbar v-if="!isPanelPage" :style="isAnnouncementActive && announcement?.position === 'top-bar' ? { top: '38px' } : {}" />
      <main>
        <slot />
      </main>
      <AppFooter v-if="!isPanelPage" />
    </div>
  </div>

  <!-- Announcement Detail Modal (富文本全景弹窗) -->
  <Transition name="banner-modal">
    <div v-if="showAnnouncementDetail" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none" @click.self="showAnnouncementDetail = false">
      <div class="glass-card p-8 rounded-3xl max-w-lg w-full space-y-6 border-2 border-amber-500/30 bg-white/95 shadow-2xl relative overflow-hidden">
        <div class="flex items-center justify-between border-b pb-4 border-black/10">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📢</span>
            <div>
              <span class="text-[10px] font-mono uppercase font-bold tracking-wider opacity-60">BROADCAST DETAIL</span>
              <h3 class="font-bold text-lg text-[#121316]">{{ announcement?.subtitle || '公告广播详情' }}</h3>
            </div>
          </div>
          <button type="button" @click="showAnnouncementDetail = false" class="text-slate-400 hover:text-black font-bold text-xl cursor-pointer">✕</button>
        </div>
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold font-mono uppercase px-2.5 py-0.5 rounded-full" :class="getBadgeClass(announcement?.badgeColor)">
              {{ announcement?.badge || 'NOTICE' }}
            </span>
          </div>
          <p class="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">{{ announcement?.text }}</p>
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-black/10">
          <span class="text-[11px] font-mono text-slate-400">Xo Studio · 实时广播网络</span>
          <div class="flex gap-2">
            <a
              v-if="announcement?.link"
              :href="announcement.link"
              class="btn-primary px-5 py-2 text-xs font-bold"
            >
              {{ announcement.ctaText || '立即前往 →' }}
            </a>
            <button type="button" @click="showAnnouncementDetail = false" class="px-5 py-2 text-xs font-bold rounded-xl border border-black/10 hover:bg-black/5 cursor-pointer">知道了</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

</template>

<script setup lang="ts">
const route = useRoute()

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

// Load full site configuration with guaranteed SSR hydration
const { data: siteConfigData } = await useAsyncData('site-config-global', () => $fetch('/api/site-config'))
const siteConfig = useState<any>('site-config', () => siteConfigData.value || {})

if (siteConfigData.value && typeof siteConfigData.value === 'object') {
  siteConfig.value = { ...siteConfig.value, ...siteConfigData.value }
}

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
  const isOrder = path === 'order' || path.startsWith('order/')
  return isAdminPage.value || isClient || isDelivery || isOrder || path === 'xo-watermark' || path.startsWith('xo-watermark/')
})

const announcement = computed(() => {
  return siteConfig.value?.announcement || siteConfigData.value?.announcement || null
})

const showAnnouncementDetail = ref(false)
const showBanner = ref(true)
const rememberDismissal = ref(true)

const DISMISSED_KEY = 'xo_announcement_dismissed'
const DISMISSED_HASH_KEY = 'xo_announcement_dismissed_hash'

const announcementHash = computed(() => {
  const a = announcement.value
  if (!a) return ''
  return `${a.enabled ? '1' : '0'}_${a.text || ''}_${a.badge || ''}_${a.position || ''}`
})

const checkBannerDismissal = () => {
  if (import.meta.client) {
    try {
      const a = announcement.value
      const isEnabled = Boolean(a?.enabled === true || a?.enabled === 'true' || a?.enabled === 1)
      const hasText = Boolean(a?.text && String(a.text).trim().length > 0)
      if (!isEnabled || !hasText) {
        showBanner.value = false
        return
      }

      const durationHours = Number(a.dismissDuration ?? 24)
      if (durationHours === 0) {
        showBanner.value = true
        return
      }

      const currentHash = announcementHash.value
      const lastDismissedHash = localStorage.getItem(DISMISSED_HASH_KEY)

      // Only hide if the visitor specifically dismissed THIS exact announcement content
      if (lastDismissedHash && lastDismissedHash === currentHash) {
        const dismissed = localStorage.getItem(DISMISSED_KEY)
        if (dismissed) {
          const timestamp = parseInt(dismissed, 10)
          if (Date.now() - timestamp < durationHours * 60 * 60 * 1000) {
            showBanner.value = false
            return
          }
        }
      }

      // In all other cases (new announcement, edited copy, or legacy dismissal), show the banner!
      showBanner.value = true
    } catch (e) {
      showBanner.value = true
    }
  }
}

// Robust unified active status check
const isAnnouncementActive = computed(() => {
  const a = announcement.value
  const isEnabled = Boolean(a?.enabled === true || a?.enabled === 'true' || a?.enabled === 1)
  const hasText = Boolean(a?.text && String(a.text).trim().length > 0)
  return isEnabled && hasText && showBanner.value && !isPanelPage.value
})

watch(siteConfigData, (newData) => {
  if (newData && typeof newData === 'object' && Object.keys(newData).length > 0) {
    siteConfig.value = { ...siteConfig.value, ...newData }
    checkBannerDismissal()
  }
}, { immediate: true })

watch(announcementHash, () => {
  checkBannerDismissal()
})

const dismissBanner = () => {
  showBanner.value = false
  if (import.meta.client) {
    try {
      if (rememberDismissal.value) {
        localStorage.setItem(DISMISSED_KEY, Date.now().toString())
        localStorage.setItem(DISMISSED_HASH_KEY, announcementHash.value)
      }
    } catch (e) {}
  }
}

const minimizeBanner = () => {
  showBanner.value = false
}

const accentColors = {
  bronze: { primary: '#b45309', primaryRgb: '180, 83, 9', hover: '#92400e' },
  gold: { primary: '#d97706', primaryRgb: '217, 119, 6', hover: '#b45309' },
  emerald: { primary: '#059669', primaryRgb: '5, 150, 105', hover: '#047857' },
  slate: { primary: '#27272a', primaryRgb: '39, 39, 42', hover: '#18181b' }
}

const showOrbs = computed(() => siteConfig.value?.theme?.showOrbs ?? true)
const showFilmGrain = computed(() => siteConfig.value?.theme?.showFilmGrain ?? true)
const preset = computed(() => siteConfig.value?.theme?.accentPreset || 'bronze')

const getBadgeClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
    case 'rose': return 'bg-rose-500/15 text-rose-700 border-rose-500/30'
    case 'indigo': return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30'
    case 'violet': return 'bg-purple-500/15 text-purple-700 border-purple-500/30'
    case 'dark': return 'bg-slate-900/10 text-slate-800 border-slate-900/20'
    default: return 'bg-amber-600/15 text-amber-800 border-amber-600/30'
  }
}

const getTopBarBgClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-950/95 border-emerald-700/40 text-emerald-100'
    case 'rose': return 'bg-rose-950/95 border-rose-700/40 text-rose-100'
    case 'indigo': return 'bg-indigo-950/95 border-indigo-700/40 text-indigo-100'
    case 'violet': return 'bg-purple-950/95 border-purple-700/40 text-purple-100'
    case 'dark': return 'bg-[#121316]/98 border-slate-700/40 text-slate-100'
    default: return 'bg-[#1a1612]/98 border-amber-800/40 text-amber-100'
  }
}

const getDotColor = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-500'
    case 'rose': return 'bg-rose-500'
    case 'indigo': return 'bg-indigo-500'
    case 'violet': return 'bg-purple-500'
    case 'dark': return 'bg-slate-700'
    default: return 'bg-amber-500'
  }
}

const getPingColor = (color?: string) => {
  switch (color) {
    case 'emerald': return 'bg-emerald-400'
    case 'rose': return 'bg-rose-400'
    case 'indigo': return 'bg-indigo-400'
    case 'violet': return 'bg-purple-400'
    case 'dark': return 'bg-slate-400'
    default: return 'bg-amber-400'
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

@keyframes shimmer-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
.animate-shimmer-sweep {
  animation: shimmer-sweep 5s infinite;
}

@keyframes fade-soft {
  0%, 100% { opacity: 0.88; }
  50% { opacity: 1; }
}
.animate-fade-soft {
  animation: fade-soft 3s ease-in-out infinite;
}
</style>

