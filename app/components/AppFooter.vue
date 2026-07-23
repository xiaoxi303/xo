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
        <div class="flex items-center gap-3 group cursor-default">
          <img
            src="/logo2.png"
            alt="Xo Logo"
            class="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div class="flex items-baseline gap-1">
            <span class="font-display text-[26px] font-bold tracking-tight" style="color: var(--color-ink-1);">{{ siteConfig?.siteInfo?.brandName || 'Xo' }}</span>
            <span class="font-display text-[26px] font-extrabold select-none" style="color: var(--color-bronze);">.</span>
            <span class="text-[9px] font-mono font-bold tracking-[0.1em] uppercase ml-2.5"
                  style="color: var(--color-ink-4);">xo.dev · 视频剪辑与调色工作室</span>
          </div>
        </div>

        <!-- Right: Premium borderless social buttons -->
        <div class="flex items-center gap-2">
          <template v-for="social in activeSocials" :key="social.label">
            <!-- Click to Copy for WeChat -->
            <button
              v-if="social.isCopy"
              @click="copySocialValue(social.value, social.label)"
              :aria-label="social.label"
              class="social-btn cursor-pointer border-none outline-none"
            >
              <span v-html="social.icon" />
            </button>
            <!-- Normal link for others -->
            <a
              v-else
              :href="social.href"
              :aria-label="social.label"
              target="_blank" rel="noopener noreferrer"
              class="social-btn"
            >
              <span v-html="social.icon" />
            </a>
          </template>
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
const wechatIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M8.28 2.05c-4.08 0-7.39 2.87-7.39 6.42 0 1.98.98 3.76 2.53 4.96-.23.68-.83 2.19-.83 2.19a.15.15 0 0 0 .22.16c.45-.29 2.05-1.28 2.91-1.8.8.22 1.66.34 2.56.34.8 0 1.58-.1 2.3-.29A6.74 6.74 0 0 1 10.3 9.4c0-3.87 3.63-7 8.11-7a9.38 9.38 0 0 1 1.76.16c-1.63-1.63-4.14-2.51-7.89-2.51zm8.38 5.7c-3.4 0-6.17 2.4-6.17 5.35 0 1.66.82 3.14 2.12 4.14-.19.57-.7 1.83-.7 1.83a.13.13 0 0 0 .19.14c.38-.25 1.71-1.07 2.43-1.5.67.18 1.39.29 2.13.29 3.4 0 6.17-2.4 6.17-5.35S20.06 7.75 16.66 7.75z"/></svg>`
const whatsappIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.628 3.971 14.152 2.943 11.526 2.94c-5.445 0-9.87 4.372-9.874 9.802-.001 1.734.469 3.43 1.36 4.939l-.988 3.604 3.7-.942.023.013zm11.367-7.802c-.3-.15-1.77-.874-2.044-.974-.275-.1-.475-.15-.675.15-.2.3-.775.974-.95 1.174-.175.2-.35.225-.65.075-1.3-.65-2.22-1.125-3.075-2.6-.225-.387.225-.362.643-.997.108-.163.054-.3-.027-.45-.08-.15-.675-1.625-.925-2.225-.244-.588-.492-.507-.675-.516-.174-.009-.374-.012-.574-.012s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.115 4.525.714.31 1.272.496 1.707.635.715.227 1.367.195 1.882.118.574-.085 1.77-.724 2.02-1.387.25-.662.25-1.225.175-1.387-.075-.162-.275-.262-.575-.412z"/></svg>`
const bilibiliIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M17.872 2.024a1 1 0 0 1 .472 1.328l-1.8 3.6H19a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h2.456l-1.8-3.6a1 1 0 1 1 1.788-.896l2.25 4.5h4.612l2.25-4.5a1 1 0 0 1 1.316-.432zM19 9H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 12a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>`
const youtubeIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.525 3.545 12 3.545 12 3.545s-7.525 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.475 20.455 12 20.455 12 20.455s7.525 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
const instagramIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`

const activeSocials = computed(() => {
  const cfg = siteConfig.value?.siteInfo || {}
  return [
    cfg.vimeoUrl       && { label: 'Vimeo',       href: cfg.vimeoUrl,       icon: vimeoIcon },
    cfg.bilibiliUrl    && { label: 'Bilibili',    href: cfg.bilibiliUrl,    icon: bilibiliIcon },
    cfg.youtubeUrl     && { label: 'YouTube',     href: cfg.youtubeUrl,     icon: youtubeIcon },
    cfg.githubUrl      && { label: 'GitHub',      href: cfg.githubUrl,      icon: githubIcon },
    cfg.twitterUrl     && { label: 'Twitter',     href: cfg.twitterUrl,     icon: twitterIcon },
    cfg.instagramUrl   && { label: 'Instagram',   href: cfg.instagramUrl,   icon: instagramIcon },
    cfg.linkedinUrl    && { label: 'LinkedIn',    href: cfg.linkedinUrl,    icon: linkedinIcon },
    cfg.whatsappNumber && { label: 'WhatsApp',    href: `https://wa.me/${cfg.whatsappNumber.replace(/[^0-9]/g, '')}`, icon: whatsappIcon },
    cfg.wechatId       && { label: '微信',        value: cfg.wechatId,      icon: wechatIcon, isCopy: true },
  ].filter(Boolean) as any[]
})

const copySocialValue = (value: string, label: string) => {
  if (import.meta.client) {
    navigator.clipboard.writeText(value).then(() => {
      alert(`🎉 ${label}号 [${value}] 已复制到剪贴板！`);
    }).catch(() => {
      alert(`${label}号为: ${value}，请手动复制。`);
    })
  }
}
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
