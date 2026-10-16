import { defineNitroPlugin } from 'nitropack/runtime'
import fs from 'node:fs'
import path from 'node:path'
import { getRuntimeDataDir, writeEncryptedJson, writeEncryptedFile, readEncryptedJson, decryptFileContent } from '../utils/storage'
import { issueOneTimePublicKey } from '../utils/vault-cipher'
import { recordFailedAttempt, resetRateLimit } from '../utils/rate-limiter'

/**
 * XO Studio · Nitro Server Auto-Initialization Plugin
 * 
 * 核心功能：
 * 1. 随应用启动（无论本地开发、Docker还是生产环境PM2部署）自动同步启动全部依赖底层资源；
 * 2. 自动检查并初始化 content 运行时目录、默认配置、分类数据、订单与持久化存储；
 * 3. 自动同步加载持久化入侵黑名单至内存高速防火墙；
 * 4. 自动预热服务端独立量子加密金库，启动每日午夜 00:00:00 自动协议轮换时钟；
 * 5. 全流程无缝一体化，部署时一键启动即完整就绪。
 */
export default defineNitroPlugin(() => {
  // 生产编译或预渲染构建阶段无需启动常驻服务时钟与运行时初始化，仅在实际服务器运行服务(dev/start/node)时挂载
  if (process.env.npm_lifecycle_event === 'build' || process.env.npm_lifecycle_event === 'build:nuxt' || process.env.NITRO_PRESET === 'prerender') {
    return
  }

  try {
    const contentDir = getRuntimeDataDir()
    const projectsDir = path.join(contentDir, 'projects')
    const ordersDir = path.join(contentDir, 'orders')
    const bookingsDir = path.join(contentDir, 'bookings')
    const mediaDir = path.join(contentDir, 'media')
    const videoDir = path.join(contentDir, 'video')
    const vaultKeysDir = path.join(contentDir, 'vault-keys')

    const configPath = path.join(contentDir, 'site-config.json')
    const pageViewsPath = path.join(contentDir, 'page-views.json')
    const blogCatsPath = path.join(contentDir, 'blog-categories.json')
    const blogPostsPath = path.join(contentDir, 'blog-posts.json')
    const blacklistPath = path.join(contentDir, 'blacklist.json')
    const securityLogsPath = path.join(contentDir, 'security-logs.json')
    const bookingsPath = path.join(contentDir, 'bookings.json')
    const ordersPath = path.join(contentDir, 'orders.json')
    const clientAccountsPath = path.join(contentDir, 'client-accounts.json')

    // 1. 保证目录结构完整存在
    const requiredDirs = [contentDir, projectsDir, ordersDir, bookingsDir, mediaDir, videoDir, vaultKeysDir]
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }

    // 2. 保证默认 site-config.json 存在
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        siteInfo: {
          brandName: "Xo",
          ownerName: "Xo",
          ownerInitial: "Z",
          contactEmail: "hello@xo.dev",
          vimeoUrl: "",
          githubUrl: "",
          twitterUrl: "",
          linkedinUrl: "",
          seoTitle: "Xo — 影视后期 · 剪辑调色",
          seoDescription: "专注于电影级视觉叙事的后期制作工作室",
          footerTagline: "基于达芬奇色彩科学规范开发"
        },
        theme: {
          accentPreset: "bronze",
          glassBlur: "md",
          showOrbs: true,
          showFilmGrain: true
        },
        announcement: {
          enabled: false,
          text: "",
          link: "",
          badge: "NOTICE"
        },
        music: {
          enabled: true,
          url: "https://assets.mixkit.co/music/preview/mixkit-ambient-dream-12.mp3"
        },
        home: {
          heroTitle1: "",
          heroTitle2: "",
          heroTitle3: "",
          heroSub: "",
          statValue1: "",
          statLabel1: "",
          statValue2: "",
          statLabel2: "",
          profileCardTitle: "",
          profileCardSub: "",
          profileCardDesc: "",
          skillsTags: [],
          bookingStatus: "",
          heroVideoUrl: "",
          heroVideoPoster: "",
          heroTechStack: []
        },
        about: {
          role: "",
          bio: "",
          bioSub: "",
          skills: [],
          experiences: [],
          philosophies: []
        },
        admin: {
          username: "admin",
          passwordHash: "06bff6534b63ba2a13c446d41a36c52c9269fefb68cf96fbec792ddfac25e44b",
          adminPath: "admin"
        },
        emailSettings: {
          enabled: false,
          smtpHost: "smtp.qq.com",
          smtpPort: 465,
          smtpSecure: true,
          smtpUser: "",
          smtpPass: "",
          senderName: "Xo Studio",
          senderEmail: ""
        }
      }
      writeEncryptedJson(configPath, defaultConfig)
    }

    // 3. 保证通用持久化数据表存在
    if (!fs.existsSync(pageViewsPath)) {
      writeEncryptedJson(pageViewsPath, { total: 0, daily: {} })
    }
    if (!fs.existsSync(blogCatsPath)) {
      const defaultCats = [
        { id: '1', name: '全部', slug: 'all', description: '所有精选文章与动态', count: 0 },
        { id: '2', name: 'Design', slug: 'design', description: 'UI/UX 交互设计与胶囊设计系统', count: 0 },
        { id: '3', name: 'Tech', slug: 'tech', description: '前沿前端技术与架构实践', count: 0 },
        { id: '4', name: 'Life', slug: 'life', description: '灵感、读书笔记与剪辑日常', count: 0 }
      ]
      writeEncryptedJson(blogCatsPath, defaultCats)
    }
    if (!fs.existsSync(blogPostsPath)) {
      writeEncryptedJson(blogPostsPath, [])
    }
    if (!fs.existsSync(blacklistPath)) {
      writeEncryptedJson(blacklistPath, [])
    }
    if (!fs.existsSync(securityLogsPath)) {
      writeEncryptedJson(securityLogsPath, [])
    }
    if (!fs.existsSync(bookingsPath)) {
      writeEncryptedJson(bookingsPath, [])
    }
    if (!fs.existsSync(ordersPath)) {
      writeEncryptedJson(ordersPath, [])
    }
    if (!fs.existsSync(clientAccountsPath)) {
      writeEncryptedJson(clientAccountsPath, [])
    }

    // 3.5 自动密库全量迁移：检查所有项目 Markdown 与运行时核心数据，自动升级至 V4 级联数字签名密文
    try {
      if (fs.existsSync(projectsDir)) {
        const mdFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'))
        for (const f of mdFiles) {
          const fullPath = path.join(projectsDir, f)
          const raw = fs.readFileSync(fullPath, 'utf8')
          if (raw && !raw.startsWith('$XO_VAULT_FILE_V4$')) {
            const plain = raw.startsWith('$XO_VAULT_FILE_V3$') ? decryptFileContent(raw) : raw
            writeEncryptedFile(fullPath, plain)
          }
        }
      }

      const sensitiveFiles = [
        configPath,
        path.join(contentDir, 'users.json'),
        path.join(contentDir, 'password-requests.json'),
        bookingsPath,
        ordersPath,
        blogPostsPath,
        blogCatsPath,
        securityLogsPath,
        blacklistPath,
        path.join(contentDir, 'order-pages.json'),
        path.join(contentDir, 'delivery-items.json'),
        path.join(contentDir, '.sessions.json'),
        path.join(contentDir, 'page-views.json'),
        path.join(contentDir, 'events.json'),
        path.join(contentDir, 'project-heat.json')
      ]

      for (const sf of sensitiveFiles) {
        if (fs.existsSync(sf)) {
          const raw = fs.readFileSync(sf, 'utf8').trim()
          if (raw && !raw.startsWith('$XO_VAULT_FILE_V4$')) {
            const plain = raw.startsWith('$XO_VAULT_FILE_V3$') ? decryptFileContent(raw) : raw
            writeEncryptedFile(sf, plain)
          }
        }
      }
    } catch (migErr) {
      console.warn('[auto-init] 密库加固与自动加密迁移异常:', migErr)
    }

    // 4. 同步加载持久化黑名单至内存高速防护网，跨部署无缝封锁
    try {
      const blList = readEncryptedJson<any[]>(blacklistPath, [])
      if (Array.isArray(blList)) {
        let count = 0
        for (const item of blList) {
          if (item.value) {
            recordFailedAttempt(item.value, 1, 86400 * 365)
            count++
          }
          if (item.machineId) {
            recordFailedAttempt(`mach:${item.machineId}`, 1, 86400 * 365)
            count++
          }
        }
        if (count > 0) {
          console.log(`[auto-init] 🛡️ 已同步激活 ${count} 条持久化黑名单/设备指纹防护。`)
        }
      }
    } catch {}

    // 清除开发与内网回路的误触锁定，确保本地访问畅通无阻
    resetRateLimit('127.0.0.1')
    resetRateLimit('::1')
    resetRateLimit('localhost')
    resetRateLimit('::ffff:127.0.0.1')
    resetRateLimit('client-ip:127.0.0.1')
    resetRateLimit('client-ip:::1')
    resetRateLimit('client-user:123')

    // 5. 自动预热服务端独立量子加密金库，签发初始公钥票据并激活午夜自动轮换定时器
    issueOneTimePublicKey('127.0.0.1')
    console.log('[vault-cipher] 🔐 Nitro boot hook: Quantum Vault active, auto-rotation timer running, system fully synchronized.')
    console.log('[auto-init] 🚀 全封闭安全系统底层全量就绪：独立密库、持久化黑名单守卫与运行时数据已同步就绪。')
  } catch (err: any) {
    console.error('[auto-init] Server auto-initialization error:', err?.message || err)
  }
})
