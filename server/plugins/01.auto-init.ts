import { defineNitroPlugin } from 'nitropack/runtime'
import fs from 'node:fs'
import path from 'node:path'
import { getRuntimeDataDir } from '../utils/storage'
import { issueOneTimePublicKey } from '../utils/vault-cipher'

/**
 * XO Studio · Nitro Server Auto-Initialization Plugin
 * 
 * 核心功能：
 * 1. 随应用启动（无论本地预览、Docker还是生产环境PM2部署）自动同步启动全部依赖底层资源；
 * 2. 自动检查并初始化 content 运行时目录、默认配置、分类数据与工程存储，免去手动执行 init-server-data；
 * 3. 自动预热服务端独立量子加密金库 (Quantum Vault)，启动每日午夜 00:00:00 自动协议轮换时钟；
 * 4. 全流程无缝一体化，部署时一键启动即完整就绪。
 */
export default defineNitroPlugin(() => {
  try {
    const contentDir = getRuntimeDataDir()
    const projectsDir = path.join(contentDir, 'projects')
    const configPath = path.join(contentDir, 'site-config.json')
    const pageViewsPath = path.join(contentDir, 'page-views.json')
    const blogCatsPath = path.join(contentDir, 'blog-categories.json')
    const blogPostsPath = path.join(contentDir, 'blog-posts.json')

    // 1. 保证目录结构存在
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true })
    }
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true })
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
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8')
    }

    // 3. 保证 page-views.json 存在
    if (!fs.existsSync(pageViewsPath)) {
      fs.writeFileSync(pageViewsPath, JSON.stringify({ total: 0, daily: {} }, null, 2), 'utf-8')
    }

    // 4. 保证文章与分类数据存在
    if (!fs.existsSync(blogCatsPath)) {
      const defaultCats = [
        { id: '1', name: '全部', slug: 'all', description: '所有精选文章与动态', count: 0 },
        { id: '2', name: 'Design', slug: 'design', description: 'UI/UX 交互设计与胶囊设计系统', count: 0 },
        { id: '3', name: 'Tech', slug: 'tech', description: '前沿前端技术与架构实践', count: 0 },
        { id: '4', name: 'Life', slug: 'life', description: '灵感、读书笔记与剪辑日常', count: 0 }
      ]
      fs.writeFileSync(blogCatsPath, JSON.stringify(defaultCats, null, 2), 'utf-8')
    }

    if (!fs.existsSync(blogPostsPath)) {
      fs.writeFileSync(blogPostsPath, JSON.stringify([], null, 2), 'utf-8')
    }

    // 5. 自动预热服务端独立量子加密金库，签发初始公钥票据并激活午夜自动轮换定时器
    issueOneTimePublicKey('127.0.0.1')
    console.log('[vault-cipher] 🔐 Nitro boot hook: Quantum Vault active, auto-rotation timer running, system fully synchronized.')
  } catch (err: any) {
    console.error('[auto-init] Server auto-initialization error:', err?.message || err)
  }
})
