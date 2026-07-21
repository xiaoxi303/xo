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

// ── Default project 1: tvc-commercial.md ──────────────────────────────────
const tvcPath = path.join(projectsDir, 'tvc-commercial.md')
if (!fs.existsSync(tvcPath)) {
  const tvcContent = `---
title: "2026 个人剪辑与后期样片秀 (Showreel)"
description: "剪辑节奏 · 电影感调色 (DaVinci) · 三维动效 (C4D)"
longDescription: "本样片秀汇集了近一年来制作的旗舰级 TVC 商业广告、高奢概念片以及运动特写镜头的高光剪辑。运用了极度紧凑的无缝音画卡点、 DaVinci ACES 广色域科学调色以及 Cinema 4D 动态流体建模。"
image: "https://images.unsplash.com/photo-1542204172-e7052809f852?w=800&q=80"
imageBefore: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80"
releaseYear: "2026"
postSpecs: "4K 60FPS HDR"
director: "Xo"
deliverFormat: "ProRes 422 HQ"
audioFormat: "24-bit 48kHz"
tags:
  - "剪辑节奏"
  - "电影感调色"
  - "三维动效"
software:
  - "Premiere Pro"
  - "DaVinci Resolve"
  - "Cinema 4D"
videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-neon-sign-with-a-retro-style-41578-large.mp4"
featured: true
password: ""
workflow:
  - icon: "🎬"
    title: "粗剪与镜头叙事"
    desc: "针对脚本镜头建立三层轨构图比对，精细调整关键卡点帧。"
  - icon: "🎨"
    title: "色彩分级"
    desc: "ACEScc 颜色管理，完成 LogC 灰片向 Rec.709 与电影 Print LUT 映射。"
---
`
  fs.writeFileSync(tvcPath, tvcContent, 'utf-8')
  console.log('✅ Created content/projects/tvc-commercial.md')
}

// ── Default project 2: sci-fi-boundary.md ─────────────────────────────────
const sciFiPath = path.join(projectsDir, 'sci-fi-boundary.md')
if (!fs.existsSync(sciFiPath)) {
  const sciFiContent = `---
title: "商业调色作品集"
description: "DaVinci Resolve · Arri LogC · ACES 工作流"
longDescription: "专注于电影级数字中间片（DI）调色科学。本合集展示了在多种极端光影环境（夜景霓虹、清晨微光、高反差大光比）下的胶片质感还原与情感色彩控制。"
image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80"
imageBefore: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80"
releaseYear: "2026"
postSpecs: "4K 24FPS HDR"
director: "Xo"
deliverFormat: "ProRes 4444 XQ"
audioFormat: "24-bit 96kHz"
tags:
  - "达芬奇调色"
  - "ACES工作流"
  - "LogC映射"
software:
  - "DaVinci Resolve"
  - "After Effects"
videoUrl: ""
featured: true
password: ""
workflow:
  - icon: "🎨"
    title: "节点色彩映射"
    desc: "建立基准平衡、高光抑止与皮肤节点，精准匹配不同机位色彩。"
  - icon: "👁️"
    title: "局部色键修饰"
    desc: "使用 Qualifiers 和 Tracker 跟踪人物肤色并分离环境基调。"
---
`
  fs.writeFileSync(sciFiPath, sciFiContent, 'utf-8')
  console.log('✅ Created content/projects/sci-fi-boundary.md')
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log('\n🎉 Server data initialized. These files are gitignored and will survive git pull.')
console.log('   Edit all settings through the admin panel at /admin\n')
