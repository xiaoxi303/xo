// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-20',
  devtools: { enabled: false },

  // Do not expose source maps in production bundles.
  sourcemap: false,

  app: {
    buildAssetsDir: '/_xo_assets/',
    pageTransition: false,
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
      ],
      script: [
        {
          children: `(function(){try{var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var locked=localStorage.getItem('xo_theme_user_locked')==='true';var d=m;if(locked){var p=localStorage.getItem('xo_theme_preset');if(p==='film-dark'||p==='dark')d=true;else if(p==='warm-linen'||p==='light')d=false;}var root=document.documentElement;if(d){root.classList.add('dark');root.setAttribute('data-theme','film-dark');root.style.colorScheme='dark';}else{root.classList.remove('dark');root.setAttribute('data-theme','warm-linen');root.style.colorScheme='light';}}catch(e){}})();`,
          type: 'text/javascript'
        }
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

  experimental: {
    appManifest: false
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

  // Security headers & route rules
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Permitted-Cross-Domain-Policies': 'none',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: wss: ws:; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none';"
      }
    },
    '/api/**': {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    }
  },

  // Production hardening: use the framework minifier with source-map stripping.
  $production: {
    vite: {
      build: {
        sourcemap: false,
        minify: 'esbuild',
        cssMinify: true
      },
      esbuild: {
        drop: ['console', 'debugger'],
        legalComments: 'none'
      }
    }
  },

  // Nuxt 4 目录规范
  future: {
    compatibilityVersion: 4
  },

  // Nitro 部署预设与服务端代码混淆/压缩配置
  nitro: {
    preset: 'node-server',
    minify: true,
    sourcemap: false,
    hidePoweredBy: true,
    prerender: {
      crawlLinks: false,
      failOnError: false,
      ignore: ['/__nuxt_content/**', '**/sql_dump.txt']
    }
  }
})
