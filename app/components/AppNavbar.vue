<template>
  <!-- Xo Studio Premium Navbar with Layout Shift Scroll Animation -->
  <header
    ref="navbarRef"
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out flex justify-center',
      isScrolled ? 'pt-4' : 'pt-0'
    ]"
  >
    <nav
      :class="[
        'transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1) flex items-center justify-between',
        isScrolled
          ? 'w-[90%] max-w-[620px] h-14 px-6 rounded-full backdrop-blur-xl border shadow-[0_8px_32px_rgba(80,60,30,0.08)]'
          : 'w-full max-w-6xl h-20 px-6 bg-transparent border-b border-transparent'
      ]"
      :style="isScrolled
        ? { background: 'rgba(252, 248, 242, 0.62)', borderColor: 'rgba(200, 185, 160, 0.3)' }
        : {}"
    >
      <!-- Brand Logo -->
      <NuxtLink
        to="/"
        class="group flex items-center gap-2.5 no-underline flex-shrink-0 transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1)"
        aria-label="Xo Home"
      >
        <img
          src="/logo.png"
          alt="Xo Logo"
          class="h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div class="flex items-baseline gap-0.5">
          <span class="font-display text-[#121316] text-2xl font-bold tracking-tight">{{ siteConfig?.siteInfo?.brandName || 'Xo' }}</span>
          <span class="font-display text-[var(--color-bronze)] text-2xl font-extrabold select-none">.</span>
        </div>
      </NuxtLink>

      <!-- Desktop nav links -->
      <ul
        :class="[
          'hidden md:flex items-center transition-all duration-[800ms] cubic-bezier(0.16, 1, 0.3, 1)',
          isScrolled ? 'gap-0.5' : 'gap-1.5'
        ]"
      >
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            :class="[
              'relative px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 rounded-lg',
              $route.path === link.to
                ? 'text-[#121316]'
                : 'text-[#82848c] hover:text-[#2d2f34]'
            ]"
          >
            {{ link.label }}
            <!-- Active underline -->
            <span
              v-if="$route.path === link.to"
              class="absolute bottom-0.5 left-3.5 right-3.5 h-px bg-[var(--color-bronze)] rounded-full"
            />
          </NuxtLink>
        </li>
      </ul>

      <!-- CTA + Mobile toggle -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <!-- Contact button -->
        <a
          :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')"
          :class="[
            'hidden md:inline-flex items-center gap-2 text-xs font-semibold tracking-wide transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1)',
            isScrolled 
              ? 'px-3.5 py-1.5 rounded-full text-[var(--color-bronze)] bg-transparent hover:bg-black/[0.03] hover:text-[var(--color-bronze-dark)]'
              : 'px-4 py-2.5 rounded-xl text-[#121316] bg-[#fdfdfc]/80 backdrop-blur-sm border border-black/[0.08] hover:bg-[#121316] hover:text-white hover:border-[#121316] hover:-translate-y-[1px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
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
          @click="mobileOpen = !mobileOpen"
          aria-label="Toggle menu"
        >
          <span :class="['block w-4.5 h-px bg-[#2d2f34] rounded-full transition-all duration-300 origin-center', mobileOpen ? 'rotate-45 translate-y-[6px]' : '']" style="width: 18px;" />
          <span :class="['block h-px bg-[#2d2f34] rounded-full transition-all duration-300', mobileOpen ? 'opacity-0 scale-x-0' : '']" style="width: 18px;" />
          <span :class="['block h-px bg-[#2d2f34] rounded-full transition-all duration-300 origin-center', mobileOpen ? '-rotate-45 -translate-y-[6px]' : '']" style="width: 18px;" />
        </button>
      </div>
    </nav>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="md:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-xl border border-black/[0.06] rounded-2xl p-3 shadow-lg flex flex-col gap-0.5"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="[
            'px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between',
            $route.path === link.to
              ? 'text-[#121316] bg-black/[0.03]'
              : 'text-[#82848c] hover:text-[#2d2f34] hover:bg-black/[0.02]'
          ]"
          @click="mobileOpen = false"
        >
          {{ link.label }}
          <span v-if="$route.path === link.to" class="w-1 h-1 rounded-full bg-[var(--color-bronze)]" />
        </NuxtLink>
        <div class="border-t border-black/[0.05] mt-2 pt-2.5 px-1">
          <a :href="'mailto:' + (siteConfig?.siteInfo?.contactEmail || 'hello@xo.dev')" class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white bg-[#121316] hover:bg-[#25262c] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 opacity-70">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            联系我
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

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileOpen.value = false
})

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 60
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
