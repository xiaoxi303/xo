<template>
  <!-- Hybrid Luxury Navbar: Normal Full-Width at Top, Fluid Morph to Floating Capsule on Scroll -->
  <header
    ref="navbarRef"
    class="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-[padding-top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="isScrolled ? 'pt-3 md:pt-3.5' : 'pt-0'"
  >
    <nav
      :class="[
        'pointer-events-auto relative flex items-center justify-between transition-[max-width,width,height,border-radius,background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isScrolled
          ? 'w-[92%] max-w-[740px] h-14 px-4 md:px-5 rounded-full border shadow-xl'
          : 'w-full max-w-7xl h-16 md:h-18 px-6 md:px-8 rounded-none border-b border-black/[0.06] shadow-none'
      ]"
      :style="isScrolled
        ? {
            background: 'rgba(253, 250, 246, 0.94)',
            borderColor: 'rgba(190, 160, 120, 0.32)',
            boxShadow: '0 12px 36px -6px rgba(80,60,30,0.12), 0 24px 48px -12px rgba(80,60,30,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }
        : {
            background: 'rgba(253, 250, 246, 0.72)',
            borderColor: 'rgba(0, 0, 0, 0.06)',
            boxShadow: 'none',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }"
    >
      <!-- Left: Brand Logo & Studio Live Badge -->
      <div class="flex items-center gap-3 flex-shrink-0 z-10">
        <NuxtLink
          to="/"
          class="group flex items-center gap-2 no-underline flex-shrink-0 transition-opacity hover:opacity-85"
          aria-label="Xo 首页"
        >
          <img
            src="/logo.png?v=312k_v4"
            alt="Xo Logo"
            class="w-auto h-7 md:h-8 object-contain"
          />
        </NuxtLink>

        <!-- Studio status chip (Visible in full-width mode, smoothly collapses in capsule) -->
        <div
          :class="[
            'hidden xl:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-600/20 text-[10px] font-mono font-bold text-emerald-800 select-none transition-all duration-400 origin-left',
            isScrolled
              ? 'opacity-0 scale-90 max-w-0 px-0 py-0 overflow-hidden pointer-events-none border-transparent'
              : 'opacity-100 scale-100 max-w-xs px-2.5 py-0.5'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span class="whitespace-nowrap">{{ siteConfig?.siteInfo?.navbarBookingBadge || 'OPEN FOR BOOKING' }}</span>
        </div>
      </div>

      <!-- Center: Desktop Nav Links (Pinned to True Screen Center in BOTH states: ZERO JUMPING) -->
      <ul
        class="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 py-1"
      >
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            :class="[
              'relative px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full flex items-center justify-center transition-all duration-300 select-none xo-kinetic-btn',
              isActive(link.to)
                ? 'text-slate-900 font-bold bg-white/95 shadow-xs border border-amber-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]'
            ]"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- Right: Contact CTA + Mobile Menu Button -->
      <div class="flex items-center gap-2 md:gap-3 flex-shrink-0 z-10">
        <!-- Contact button -->
        <AppContactBtn
          :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')"
          :customClass="[
            'hidden md:inline-flex text-xs font-bold tracking-wide transition-all duration-300 rounded-full shadow-xs group cursor-pointer border',
            isScrolled 
              ? 'px-4 py-1.5 text-slate-900 bg-amber-500/15 border-amber-600/30 hover:bg-amber-500/25'
              : 'px-5 py-2 text-white bg-slate-900 border-white/10 hover:bg-slate-800'
          ].join(' ')"
        />

        <!-- Mobile hamburger -->
        <button
          class="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-full hover:bg-black/[0.04] transition-colors"
          @click="toggleMobile"
          aria-label="Toggle menu"
        >
          <span :class="['block w-4.5 h-px bg-[var(--color-ink-2)] rounded-full transition-all duration-300 origin-center', mobileOpen ? 'rotate-45 translate-y-[6px]' : '']" style="width: 18px;" />
          <span :class="['block h-px bg-[var(--color-ink-2)] rounded-full transition-all duration-300', mobileOpen ? 'opacity-0 scale-x-0' : '']" style="width: 18px;" />
          <span :class="['block h-px bg-[var(--color-ink-2)] rounded-full transition-all duration-300 origin-center', mobileOpen ? '-rotate-45 -translate-y-[6px]' : '']" style="width: 18px;" />
        </button>
      </div>
    </nav>

    <!-- Mobile menu modal -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="pointer-events-auto md:hidden absolute top-full left-4 right-4 mt-2 rounded-3xl p-3 flex flex-col gap-1 backdrop-blur-2xl"
        :style="{
          background: 'rgba(253, 250, 246, 0.96)',
          border: '1px solid rgba(190, 160, 120, 0.3)',
          boxShadow: '0 20px 48px -10px rgba(80,60,30,0.18)'
        }"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="[
            'px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-between',
            isActive(link.to)
              ? 'text-[var(--color-ink-1)] bg-amber-500/10 font-bold border border-amber-600/20 shadow-xs'
              : 'text-[var(--color-ink-4)] hover:text-[var(--color-ink-2)] hover:bg-white/60'
          ]"
          @click="mobileOpen = false"
        >
          <span>{{ link.label }}</span>
          <span v-if="isActive(link.to)" class="w-2 h-2 rounded-full bg-[var(--color-bronze)]" />
        </NuxtLink>
        <div class="border-t mt-2 pt-2 px-1" style="border-color: rgba(0,0,0,0.06);">
          <a 
            :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" 
            class="group flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-[0_8px_25px_rgba(217,119,6,0.4)] transition-all duration-300 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 opacity-90 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <span>发起合作咨询</span>
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const navbarRef = ref<HTMLElement | null>(null)
const isScrolled = ref(false)
const mobileOpen = ref(false)

const { data: siteConfig } = useFetch<any>('/api/site-config', { lazy: true })

const navLinks = [
  { label: '首页', to: '/' },
  { label: '作品集', to: '/projects' },
  { label: '合作预约', to: '/booking' },
  { label: '关于我', to: '/about' },
  { label: '博客', to: '/blog' },
]

// Check if link is active (handle trailing slashes)
const isActive = (path: string) => {
  const currentPath = route.path.replace(/\/$/, '') || '/'
  const linkPath = path.replace(/\/$/, '') || '/'
  return currentPath === linkPath
}

// Toggle mobile menu with body scroll lock
const toggleMobile = () => {
  mobileOpen.value = !mobileOpen.value
  if (import.meta.client) {
    document.body.style.overflow = mobileOpen.value ? 'hidden' : ''
  }
}

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileOpen.value = false
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

let navAnimated = false
const animateNavbarIn = async () => {
  if (!import.meta.client || !navbarRef.value || navAnimated) return
  navAnimated = true
  const { gsap } = await import('gsap')
  gsap.fromTo(
    navbarRef.value,
    { opacity: 0, y: -25 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
  )
}

// Smooth Hardware RAF Scroll handler with Hysteresis
let scrollHandler: (() => void) | null = null
let rafTicking = false
const SCROLL_ACTIVATE_THRESHOLD = 50
const SCROLL_DEACTIVATE_THRESHOLD = 20

onMounted(() => {
  scrollHandler = () => {
    if (!rafTicking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY || document.documentElement.scrollTop
        if (!isScrolled.value && y > SCROLL_ACTIVATE_THRESHOLD) {
          isScrolled.value = true
        } else if (isScrolled.value && y < SCROLL_DEACTIVATE_THRESHOLD) {
          isScrolled.value = false
        }
        rafTicking = false
      })
      rafTicking = true
    }
  }

  window.addEventListener('scroll', scrollHandler, { passive: true })
  
  // Initial check
  const initY = window.scrollY || document.documentElement.scrollTop
  isScrolled.value = initY > SCROLL_ACTIVATE_THRESHOLD

  if (import.meta.client) {
    animateNavbarIn()
  }
})

onBeforeUnmount(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
nav {
  will-change: max-width, width, height, border-radius, background-color, box-shadow;
  transform: translateZ(0);
}

/* Mobile menu transition */
.mobile-menu-enter-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.7, 0, 0.84, 0);
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
