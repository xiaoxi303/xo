<template>
  <!-- Premium Navbar with Hardware-Accelerated Smooth Capsule Morph -->
  <header
    ref="navbarRef"
    :class="[
      'fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-[padding-top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
      isScrolled ? 'pt-2.5 md:pt-3.5' : 'pt-0'
    ]"
  >
    <nav
      :class="[
        'pointer-events-auto h-14 transition-[max-width,width,border-radius,background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between',
        isScrolled
          ? 'w-[94%] max-w-[760px] px-5 md:px-7 rounded-full border shadow-lg'
          : 'w-full max-w-6xl px-4 md:px-6 rounded-none border-b border-transparent shadow-none'
      ]"
      :style="isScrolled
        ? { 
            background: 'rgba(253, 250, 246, 0.88)', 
            borderColor: 'rgba(190, 160, 120, 0.28)',
            boxShadow: '0 8px 32px -4px rgba(80,60,30,0.08), 0 20px 48px -8px rgba(80,60,30,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }
        : {
            background: 'rgba(253, 250, 246, 0.0)',
            borderColor: 'transparent',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }"
    >
      <!-- Brand Logo & Studio Live Badge -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <NuxtLink
          to="/"
          class="group flex items-center gap-2 no-underline flex-shrink-0 transition-opacity hover:opacity-85"
          aria-label="Xo 首页"
        >
          <img
            src="/logo.png?v=312k_v4"
            alt="Xo Logo"
            class="w-auto h-7.5 md:h-8 object-contain"
          />
        </NuxtLink>

        <!-- Studio status micro chip (Smooth Fade Collapse without DOM Reflow) -->
        <div
          :class="[
            'hidden xl:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-600/20 text-[10px] font-mono font-bold text-emerald-800 select-none transition-all duration-300 origin-left',
            isScrolled
              ? 'opacity-0 scale-90 max-w-0 px-0 py-0 overflow-hidden pointer-events-none border-transparent'
              : 'opacity-100 scale-100 max-w-xs px-2.5 py-0.5'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span class="whitespace-nowrap">{{ siteConfig?.siteInfo?.navbarBookingBadge || 'OPEN FOR BOOKING' }}</span>
        </div>
      </div>

      <!-- Desktop nav links with Liquid Magnetic Sliding Pill -->
      <ul
        ref="navUlRef"
        class="hidden md:flex items-center relative gap-1 py-1"
        @mouseleave="resetPillToActive"
      >
        <!-- Liquid Sliding Pill Background Indicator -->
        <span
          class="absolute top-1 bottom-1 rounded-full pointer-events-none transition-all duration-[300ms] cubic-bezier(0.22, 1, 0.36, 1) z-0"
          :style="{
            transform: `translate3d(${pillLeft}px, 0, 0)`,
            width: `${pillWidth}px`,
            opacity: pillOpacity,
            background: 'rgba(255, 255, 255, 0.94)',
            boxShadow: '0 4px 16px rgba(180, 120, 40, 0.12), inset 0 1px 0 rgba(255,255,255,0.98)',
            border: '1px solid rgba(217, 119, 6, 0.22)'
          }"
        />

        <li
          v-for="link in navLinks"
          :key="link.to"
          :ref="el => setItemRef(link.to, el as HTMLElement)"
          class="relative z-10"
          @mouseenter="movePillTo(link.to)"
        >
          <NuxtLink
            :to="link.to"
            :class="[
              'relative px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-200 rounded-full flex items-center justify-center select-none xo-kinetic-btn',
              isActive(link.to)
                ? 'text-[var(--color-ink-1)] font-bold'
                : 'text-[var(--color-ink-4)] hover:text-[var(--color-ink-1)]'
            ]"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- CTA + Mobile toggle -->
      <div class="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <!-- Contact button with cursor position radial color fill -->
        <AppContactBtn
          :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')"
          :customClass="[
            'hidden md:inline-flex text-xs font-bold tracking-wide transition-all duration-300 rounded-full shadow-sm group cursor-pointer border px-4.5 py-1.5',
            isScrolled 
              ? 'text-slate-900 bg-amber-500/15 border-amber-600/30 hover:bg-amber-500/25'
              : 'text-white bg-slate-900 border-white/10 hover:bg-slate-800'
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

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="pointer-events-auto md:hidden absolute top-full left-4 right-4 mt-2 rounded-3xl p-3 flex flex-col gap-1 backdrop-blur-2xl"
        :style="{
          background: 'rgba(253, 250, 246, 0.94)',
          border: '1px solid rgba(190, 160, 120, 0.25)',
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

const navUlRef = ref<HTMLElement | null>(null)
const itemRefs = new Map<string, HTMLElement>()
const setItemRef = (path: string, el: HTMLElement | null) => {
  if (el) itemRefs.set(path, el)
  else itemRefs.delete(path)
}

const pillLeft = ref(0)
const pillWidth = ref(0)
const pillOpacity = ref(0)

const updatePillPosition = (targetPath: string) => {
  if (!import.meta.client || !navUlRef.value) return
  const targetEl = itemRefs.get(targetPath)
  if (!targetEl) {
    pillOpacity.value = 0
    return
  }
  const ulRect = navUlRef.value.getBoundingClientRect()
  const elRect = targetEl.getBoundingClientRect()
  pillLeft.value = elRect.left - ulRect.left
  pillWidth.value = elRect.width
  pillOpacity.value = 1
}

const movePillTo = (path: string) => {
  updatePillPosition(path)
}

const resetPillToActive = () => {
  const currentPath = route.path.replace(/\/$/, '') || '/'
  const matched = navLinks.find(l => (l.to.replace(/\/$/, '') || '/') === currentPath)
  if (matched) {
    updatePillPosition(matched.to)
  } else {
    pillOpacity.value = 0
  }
}

// Watch isScrolled to seamlessly recalibrate pill position during capsule morph
watch(isScrolled, () => {
  if (import.meta.client) {
    requestAnimationFrame(() => resetPillToActive())
    setTimeout(() => resetPillToActive(), 200)
    setTimeout(() => resetPillToActive(), 520)
  }
})

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

// Close mobile menu on route change & update pill
watch(() => route.path, () => {
  mobileOpen.value = false
  if (import.meta.client) {
    document.body.style.overflow = ''
    nextTick(() => resetPillToActive())
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

// Ultra-smooth Hardware RAF Scroll handler with Hysteresis
let scrollHandler: (() => void) | null = null
let resizeHandler: (() => void) | null = null
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

  resizeHandler = () => {
    resetPillToActive()
  }

  window.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('resize', resizeHandler, { passive: true })
  
  // Initial check
  const initY = window.scrollY || document.documentElement.scrollTop
  isScrolled.value = initY > SCROLL_ACTIVATE_THRESHOLD

  if (import.meta.client) {
    animateNavbarIn()
    nextTick(() => resetPillToActive())
  }
})

onBeforeUnmount(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
nav {
  will-change: max-width, transform, background-color, box-shadow;
  transform: translateZ(0);
}

/* Nav underline transition */
.nav-underline-enter-active,
.nav-underline-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-underline-enter-from,
.nav-underline-leave-to {
  opacity: 0;
  transform: scaleX(0.2) translateY(2px);
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

/* Check mark transition */
.check-mark-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.check-mark-leave-active {
  transition: all 0.15s ease;
}
.check-mark-enter-from,
.check-mark-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
