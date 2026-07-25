<template>
  <!-- Premium Navbar with Smooth Capsule Morph -->
  <header
    ref="navbarRef"
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out flex justify-center',
      isScrolled ? 'pt-3 md:pt-4' : 'pt-0'
    ]"
  >
    <nav
      :class="[
        'transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1) flex items-center justify-between',
        isScrolled
          ? 'w-[92%] max-w-[640px] h-14 px-5 md:px-6 rounded-full backdrop-blur-xl border'
          : 'w-full max-w-6xl h-16 md:h-20 px-4 md:px-6 bg-transparent border-b border-transparent'
      ]"
      :style="isScrolled
        ? { 
            background: 'var(--glass-bg)', 
            borderColor: 'var(--glass-border-inner)',
            boxShadow: 'var(--glass-shadow)'
          }
        : {}"
    >
      <!-- Brand Logo -->
      <NuxtLink
        to="/"
        class="group flex items-center gap-2 no-underline flex-shrink-0 transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1)"
        aria-label="Xo Home"
      >
        <img
          src="/logo.png?v=312k_v4"
          alt="Xo Logo"
          :class="[
            'w-auto object-contain transition-all duration-500',
            isScrolled ? 'h-7' : 'h-8'
          ]"
        />
      </NuxtLink>

      <!-- Desktop nav links -->
      <ul
        :class="[
          'hidden md:flex items-center transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1)',
          isScrolled ? 'gap-0.5' : 'gap-1'
        ]"
      >
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            :class="[
              'relative px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 rounded-lg group',
              isActive(link.to)
                ? 'text-[var(--color-ink-1)] font-bold'
                : 'text-[var(--color-ink-5)] hover:text-[var(--color-ink-2)]'
            ]"
          >
            {{ link.label }}
            <!-- Active underline transition -->
            <Transition name="nav-underline">
              <span
                v-if="isActive(link.to)"
                class="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-[var(--color-bronze)] rounded-full shadow-[0_2px_8px_var(--color-bronze-glow)]"
              />
            </Transition>
          </NuxtLink>
        </li>
      </ul>

      <!-- CTA + Mobile toggle -->
      <div class="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <!-- Contact button -->
        <a
          :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')"
          :class="[
            'hidden md:inline-flex items-center gap-2 text-xs font-semibold tracking-wide transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1)',
            isScrolled 
              ? 'px-3.5 py-1.5 rounded-full text-[var(--color-bronze)] bg-transparent hover:bg-[var(--color-bronze-bg)] hover:text-[var(--color-bronze-dark)]'
              : 'px-4 py-2 rounded-xl text-[var(--color-ink-1)] bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--color-border)] hover:bg-[var(--color-ink-1)] hover:text-white hover:border-[var(--color-ink-1)] hover:-translate-y-[1px] shadow-sm'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 opacity-85">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
          </svg>
          <span class="tracking-[0.06em]">联系我</span>
        </a>

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
        class="md:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl p-3 flex flex-col gap-0.5"
        :style="{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border-inner)',
          boxShadow: 'var(--glass-shadow-lg)'
        }"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="[
            'px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between',
            isActive(link.to)
              ? 'text-[var(--color-ink-1)] bg-[var(--color-surface)]'
              : 'text-[var(--color-ink-5)] hover:text-[var(--color-ink-2)] hover:bg-[var(--color-surface-3)]'
          ]"
          @click="mobileOpen = false"
        >
          <span>{{ link.label }}</span>
          <Transition name="check-mark">
            <span v-if="isActive(link.to)" class="w-1.5 h-1.5 rounded-full bg-[var(--color-bronze)]" />
          </Transition>
        </NuxtLink>
        <div class="border-t mt-2 pt-2 px-1" :style="{ borderColor: 'var(--color-border)' }">
          <a 
            :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" 
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            :style="{ background: 'var(--color-ink-1)' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 opacity-70">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <span>联系我</span>
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

const { data: siteConfig } = await useFetch<any>('/api/site-config')

const navLinks = [
  { label: '首页', to: '/' },
  { label: '作品集', to: '/projects' },
  { label: '关于我', to: '/about' },
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

// Scroll handler
let scrollHandler: (() => void) | null = null

onMounted(() => {
  scrollHandler = () => {
    isScrolled.value = window.scrollY > 60
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
  scrollHandler()
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
