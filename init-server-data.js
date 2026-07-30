#!/usr/bin/env node
/**
 * init-server-data.js (ES Module)
 * Run this automatically or manually to ensure default content files exist.
 * Files in content/ are gitignored, so git pull will NEVER overwrite them.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const contentDir = path.resolve(__dirname, 'content')
const projectsDir = path.join(contentDir, 'projects')
const configPath = path.join(contentDir, 'site-config.json')
const pageViewsPath = path.join(contentDir, 'page-views.json')

// ── Ensure directories exist ──────────────────────────────────────────────
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true })
  console.log('✅ Created content/')
}
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true })
  console.log('✅ Created content/projects/')
}

// ── Default site-config ───────────────────────────────────────────────────
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
  console.log('✅ Created content/site-config.json (default config)')
} else {
  console.log('⏭️  content/site-config.json already exists — skipped (no overwrite)')
}

// ── Default page-views ────────────────────────────────────────────────────
if (!fs.existsSync(pageViewsPath)) {
  fs.writeFileSync(pageViewsPath, JSON.stringify({ total: 0, daily: {} }, null, 2), 'utf-8')
  console.log('✅ Created content/page-views.json')
} else {
  console.log('⏭️  content/page-views.json already exists — skipped')
}

// ── Default blog-posts & categories ──────────────────────────────────────
const blogPostsPath = path.join(contentDir, 'blog-posts.json')
const blogCatsPath = path.join(contentDir, 'blog-categories.json')

if (!fs.existsSync(blogCatsPath)) {
  const defaultCats = [
    { id: '1', name: '全部', slug: 'all', description: '所有精选文章与动态', count: 0 },
    { id: '2', name: 'Design', slug: 'design', description: 'UI/UX 交互设计与胶囊设计系统', count: 0 },
    { id: '3', name: 'Tech', slug: 'tech', description: '前沿前端技术与架构实践', count: 0 },
    { id: '4', name: 'Life', slug: 'life', description: '灵感、读书笔记与剪辑日常', count: 0 }
  ]
  fs.writeFileSync(blogCatsPath, JSON.stringify(defaultCats, null, 2), 'utf-8')
  console.log('✅ Created content/blog-categories.json')
}

if (!fs.existsSync(blogPostsPath)) {
  fs.writeFileSync(blogPostsPath, JSON.stringify([], null, 2), 'utf-8')
  console.log('✅ Created content/blog-posts.json')
}



// ── Summary ───────────────────────────────────────────────────────────────
console.log('\n🎉 Server data initialized. These files are gitignored and will survive git pull.')
console.log('   Edit all settings through the admin panel at /admin\n')
