// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-20',
  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png?v=312k_v4' },
        { rel: 'apple-touch-icon', href: '/logo.png?v=312k_v4' },
        // Preload Xo Display font
        { rel: 'preload', href: '/fonts/xo-display.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        // Preload Xo Sans font
        { rel: 'preload', href: '/fonts/xo-sans.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }
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
