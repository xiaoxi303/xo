<template>
  <footer class="relative z-10 mt-28 pt-20 pb-16">
    <!-- Premium thin gradient divider -->
    <div class="max-w-6xl mx-auto px-6 mb-12">
      <div class="h-[1px] w-full" style="background: linear-gradient(90deg, transparent, var(--color-border) 15%, var(--color-border) 85%, transparent);" />
    </div>

    <div class="max-w-6xl mx-auto px-6">
      <!-- Main Row -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-8">

        <!-- Left: Brand Block -->
        <div class="flex items-baseline gap-1 group cursor-default">
          <span class="font-display text-[26px] font-bold tracking-tight" style="color: var(--color-ink-1);">{{ siteConfig?.siteInfo?.brandName || 'Xo' }}</span>
          <span class="font-display text-[26px] font-extrabold select-none" style="color: var(--color-bronze);">.</span>
          <span class="text-[9px] font-mono font-bold tracking-[0.1em] uppercase ml-2.5"
                style="color: var(--color-ink-4);">xo.dev · 视频剪辑与调色工作室</span>
        </div>

        <!-- Right: Premium borderless social buttons -->
        <div class="flex items-center gap-2">
          <a
            v-for="social in activeSocials"
            :key="social.label"
            :href="social.href"
            :aria-label="social.label"
            target="_blank" rel="noopener noreferrer"
            class="social-btn"
          >
            <span v-html="social.icon" />
          </a>
        </div>
      </div>

      <!-- Bottom metadata footer -->
      <div class="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
           style="border-top: 1px solid rgba(0,0,0,0.04);">
        <p class="text-[9px] font-mono tracking-[0.1em]" style="color: var(--color-ink-5);">
          © {{ new Date().getFullYear() }} {{ siteConfig?.siteInfo?.brandName || 'Xo' }} · 保留所有权利
        </p>
        <p class="text-[9px] font-mono tracking-[0.15em] flex items-center gap-2" style="color: var(--color-ink-5);">
          <span>{{ siteConfig?.siteInfo?.footerTagline || '基于达芬奇色彩科学规范开发' }}</span>
          <span class="w-1.5 h-1.5 rounded-full" style="background: var(--color-bronze); opacity: 0.6;" />
          <span>xo.dev</span>
        </p>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
const { data: siteConfig } = await useFetch<any>('/api/site-config')

const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`
const twitterIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
const linkedinIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
const vimeoIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.612-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.478 4.807z"/></svg>`

const activeSocials = computed(() => {
  const cfg = siteConfig.value?.siteInfo || {}
  return [
    cfg.vimeoUrl    && { label: 'Vimeo',    href: cfg.vimeoUrl,    icon: vimeoIcon },
    cfg.githubUrl   && { label: 'GitHub',   href: cfg.githubUrl,   icon: githubIcon },
    cfg.twitterUrl  && { label: 'Twitter',  href: cfg.twitterUrl,  icon: twitterIcon },
    cfg.linkedinUrl && { label: 'LinkedIn', href: cfg.linkedinUrl, icon: linkedinIcon },
  ].filter(Boolean) as { label: string; href: string; icon: string }[]
})
</script>

<style scoped>
.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink-4);
  background: rgba(180, 83, 9, 0.03);
  border: 1px solid rgba(180, 83, 9, 0.05);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.social-btn:hover {
  color: var(--color-bronze);
  background: rgba(180, 83, 9, 0.08);
  border-color: rgba(180, 83, 9, 0.20);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(180, 83, 9, 0.05);
}
</style>
