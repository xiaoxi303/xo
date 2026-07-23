// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-20',
  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' }
      ]
    }
  },

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/image'
  ],

  build: {
    transpile: ['gsap']
  },

  // @nuxt/image 配置 (使用服务器磁盘 IPX 高效图像处理引擎)
  image: {
    provider: 'ipx',
    quality: 85,
    format: ['webp', 'avif']
  },

  // @nuxt/content v3 配置
  content: {},

  css: [
    '~/assets/css/main.css'
  ],

  // Nuxt 4 目录规范
  future: {
    compatibilityVersion: 4
  },

  // Nitro 部署预设配置：标准 Node 服务器，支持服务器磁盘读写。
  nitro: {
    preset: 'node-server'
  }
})
