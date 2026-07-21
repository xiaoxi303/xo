import { H3Event } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

let isDbInitialized = false

// Helper to get D1 database and auto-initialize tables
export async function getD1Database(event: H3Event) {
  const env = event.context.cloudflare?.env
  const db = env?.DB || env?.D1
  if (!db) return null

  if (!isDbInitialized) {
    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          slug TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          image TEXT,
          imageBefore TEXT,
          videoUrl TEXT,
          software TEXT,
          tags TEXT,
          featured INTEGER DEFAULT 0,
          description TEXT,
          longDescription TEXT,
          workflow TEXT,
          password TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS site_config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS page_views (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT NOT NULL,
          date TEXT NOT NULL,
          count INTEGER DEFAULT 1,
          UNIQUE(path, date)
        );
        CREATE TABLE IF NOT EXISTS analytics_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event TEXT NOT NULL,
          meta TEXT,
          ts DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `)
      // Try to alter table in case the schema already existed without the password and imageBefore columns
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN password TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN imageBefore TEXT;`)
      } catch (e) {}
      isDbInitialized = true
    } catch (err) {
      console.error('D1 auto-initialization failed:', err)
    }
  }

  return db
}

// ==========================================
// Robust YAML & Markdown Parser for Local Fallback
// ==========================================

function parseYaml(yamlStr: string): any {
  const result: any = {}
  let currentKey = ''
  const lines = yamlStr.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd()
    if (!line) continue

    const trimmed = line.trim()
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (trimmed.startsWith('-') && !trimmed.includes(':') && currentKey) {
        const val = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, '')
        if (!Array.isArray(result[currentKey])) {
          result[currentKey] = []
        }
        result[currentKey].push(val)
        continue
      }
      // Skip nested fields (like title, desc inside workflow) to prevent overwriting root keys
      continue
    }

    if (trimmed.startsWith('-') && !trimmed.includes(':') && currentKey) {
      const val = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, '')
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = []
      }
      result[currentKey].push(val)
      continue
    }

    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim()
      const val = line.substring(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '')

      if (val === '') {
        currentKey = key
        result[key] = null
      } else if (val === 'true') {
        result[key] = true
      } else if (val === 'false') {
        result[key] = false
      } else {
        result[key] = val
      }
    }
  }

  const workflowMatch = yamlStr.match(/workflow:\s*([\s\S]*?)(?=\n\w+:|$)/)
  if (workflowMatch) {
    const items = []
    const itemBlocks = workflowMatch[1].split(/\n\s*-\s+/g)
    for (let block of itemBlocks) {
      block = block.trim()
      if (!block) continue
      const item: any = {}
      const lines = block.split('\n')
      for (const line of lines) {
        const cIdx = line.indexOf(':')
        if (cIdx !== -1) {
          const k = line.substring(0, cIdx).trim()
          const v = line.substring(cIdx + 1).trim().replace(/^['"]|['"]$/g, '')
          item[k] = v
        }
      }
      if (item.title || item.desc) {
        items.push(item)
      }
    }
    result.workflow = items
  }

  return result
}

function parseMarkdownFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const parts = content.split('---')
  if (parts.length >= 3) {
    const yamlStr = parts[1]
    const body = parts.slice(2).join('---').trim()
    const meta = parseYaml(yamlStr)
    return {
      slug: path.basename(filePath, '.md'),
      ...meta,
      body
    }
  }
  return { slug: path.basename(filePath, '.md') }
}

function stringifyYaml(data: any): string {
  const lines = []
  lines.push(`title: "${(data.title || '').replace(/"/g, '\\"')}"`)
  lines.push(`description: "${(data.description || '').replace(/"/g, '\\"')}"`)
  lines.push(`longDescription: "${(data.longDescription || '').replace(/"/g, '\\"')}"`)
  lines.push(`image: "${(data.image || '').replace(/"/g, '\\"')}"`)
  lines.push(`videoUrl: "${(data.videoUrl || '').replace(/"/g, '\\"')}"`)
  lines.push(`password: "${(data.password || '').replace(/"/g, '\\"')}"`)
  lines.push(`imageBefore: "${(data.imageBefore || '').replace(/"/g, '\\"')}"`)
  
  if (Array.isArray(data.tags)) {
    lines.push('tags:')
    data.tags.forEach((tag: string) => {
      lines.push(`  - "${tag.replace(/"/g, '\\"')}"`)
    })
  } else {
    lines.push('tags: []')
  }
  
  if (Array.isArray(data.software)) {
    lines.push('software:')
    data.software.forEach((s: string) => {
      lines.push(`  - "${s.replace(/"/g, '\\"')}"`)
    })
  } else {
    lines.push('software: []')
  }
  
  lines.push(`featured: ${!!data.featured}`)
  
  if (Array.isArray(data.workflow)) {
    lines.push('workflow:')
    data.workflow.forEach((item: any) => {
      lines.push(`  - icon: "${(item.icon || '⚡').replace(/"/g, '\\"')}"`)
      lines.push(`    title: "${(item.title || '').replace(/"/g, '\\"')}"`)
      lines.push(`    desc: "${(item.desc || '').replace(/"/g, '\\"')}"`)
    })
  }
  
  return lines.join('\n')
}

// ==========================================
// CRUD / Operations Dispatcher (D1 or Local File System)
// ==========================================

export async function dbGetProjects(event: H3Event): Promise<any[]> {
  const db = await getD1Database(event)
  if (db) {
    const { results } = await db.prepare('SELECT * FROM projects ORDER BY featured DESC, createdAt DESC').all()
    return results.map((row: any) => ({
      ...row,
      featured: Boolean(row.featured),
      software: row.software ? JSON.parse(row.software) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      workflow: row.workflow ? JSON.parse(row.workflow) : []
    }))
  }

  // Fallback
  const projectsDir = path.resolve(process.cwd(), 'content/projects')
  if (!fs.existsSync(projectsDir)) return []
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'))
  const projects = files.map(file => parseMarkdownFile(path.join(projectsDir, file)))
  return projects.sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
}

export async function dbCreateProject(event: H3Event, body: any): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    // Check if duplicate exists
    const duplicate = await db.prepare('SELECT slug FROM projects WHERE slug = ?').bind(body.slug).first()
    if (duplicate) {
      throw createError({ statusCode: 409, statusMessage: 'A project with this slug already exists.' })
    }

    await db.prepare(`
      INSERT INTO projects (slug, title, image, imageBefore, videoUrl, software, tags, featured, description, longDescription, workflow, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.slug,
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || '',
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || ''
    ).run()
    return
  }

  // Fallback
  const projectsDir = path.resolve(process.cwd(), 'content/projects')
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true })
  }
  const fileName = `${body.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '')}.md`
  const filePath = path.join(projectsDir, fileName)
  if (fs.existsSync(filePath)) {
    throw createError({ statusCode: 409, statusMessage: 'A project with this slug already exists.' })
  }
  const fileContent = `---\n${stringifyYaml(body)}\n---\n\n${body.body || ''}\n`
  fs.writeFileSync(filePath, fileContent, 'utf-8')
}

export async function dbUpdateProject(event: H3Event, body: any): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    const project = await db.prepare('SELECT slug FROM projects WHERE slug = ?').bind(body.slug).first()
    if (!project) {
      throw createError({ statusCode: 404, statusMessage: 'Project not found.' })
    }

    await db.prepare(`
      UPDATE projects
      SET title = ?, image = ?, imageBefore = ?, videoUrl = ?, software = ?, tags = ?, featured = ?, description = ?, longDescription = ?, workflow = ?, password = ?
      WHERE slug = ?
    `).bind(
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || '',
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || '',
      body.slug
    ).run()
    return
  }

  // Fallback
  const projectsDir = path.resolve(process.cwd(), 'content/projects')
  const fileName = `${body.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '')}.md`
  const filePath = path.join(projectsDir, fileName)
  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found.' })
  }
  const fileContent = `---\n${stringifyYaml(body)}\n---\n\n${body.body || ''}\n`
  fs.writeFileSync(filePath, fileContent, 'utf-8')
}

export async function dbDeleteProject(event: H3Event, slug: string): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    await db.prepare('DELETE FROM projects WHERE slug = ?').bind(slug).run()
    return
  }

  // Fallback
  const projectsDir = path.resolve(process.cwd(), 'content/projects')
  const fileName = `${slug.toLowerCase().replace(/[^a-z0-9-_]/g, '')}.md`
  const filePath = path.join(projectsDir, fileName)
  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found.' })
  }
  fs.unlinkSync(filePath)
}

// Default config blueprint
const defaultConfig = {
  siteInfo: {
    brandName: "Xo",
    ownerName: "Xo",
    ownerInitial: "Z",
    contactEmail: "hello@xo.dev",
    vimeoUrl: "https://vimeo.com",
    githubUrl: "https://github.com",
    twitterUrl: "https://twitter.com",
    linkedinUrl: "https://linkedin.com",
    seoTitle: "Xo Studio · 影视后期剪辑与调色",
    seoDescription: "专注于 TVC 广告、品牌形象宣传片、科技感产品动效包装，以及高画质纪录片的后期全流程开发。",
    footerTagline: "基于达芬奇色彩科学规范开发"
  },
  theme: {
    accentPreset: "bronze",
    glassBlur: "md",
    showOrbs: true,
    showFilmGrain: true
  },
  announcement: {
    enabled: true,
    text: "🎬 2026 年下下来商业 TVC 档期与电影 DI 调色开放预订中",
    link: "mailto:hello@xo.dev",
    badge: "NOTICE"
  },
  music: {
    enabled: true,
    url: "https://assets.mixkit.co/music/preview/mixkit-ambient-dream-12.mp3"
  },
  home: {
    heroTitle1: "用剪辑",
    heroTitle2: "重塑时间",
    heroTitle3: "与故事",
    heroSub: "资深视频剪辑师 & 调色包装设计师。专注于 TVC 广告、品牌形象宣传片、科技感产品动效包装，以及高画质纪录片的后期全流程开发。",
    statValue1: "120+",
    statLabel1: "剪辑交付量",
    statValue2: "4K HDR",
    statLabel2: "高规格支持",
    profileCardTitle: "Xo",
    profileCardSub: "DI / Film Editor",
    profileCardDesc: "专注于用节拍与叙事节奏微雕镜头。拥有 5 年影视及广告后期制作经验，主导过多个品牌形象概念片的后期开发与色彩美学搭建。",
    skillsTags: ["Resolve", "Premiere", "After Effects", "Cinema 4D", "ACES Workflow", "Logic Pro", "Foley Sound"],
    bookingStatus: "Booking Open (2026)",
    heroVideoUrl: "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4",
    heroVideoPoster: "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?w=800&q=80",
    heroTechStack: ["Pr / Resolve / AE", "Cinema 4D", "VFX Compositing", "DI Color Science"]
  },
  about: {
    role: "影视后期剪辑指导 & DI 调色总监",
    bio: "你好，我是 Xo，一名专注于极致视觉体验与叙事节奏的后期制作人。拥有 5 年影视及商业视频后期制作经验，曾为多个头部数码硬件、高奢潮牌及汽车品牌交付主视觉概念片。",
    bioSub: "我相信镜头是有呼吸的，每一个调色色键、每一段声音过渡都是对情感的潜意识引导。让画面本身说话，用节奏感编织出令人印象深刻的数字故事，是我持之以恒的追求。",
    skills: [
      { name: "Video Editing", level: 95 },
      { name: "Color Grading", level: 90 },
      { name: "Motion VFX", level: 85 },
      { name: "Sound Design", level: 80 }
    ],
    experiences: [
      {
        role: "资深剪辑指导 / DI 调色总监",
        company: "TechCreative Studio",
        period: "2023 — 至今",
        desc: "主导商业 TVC、高端品牌概念宣传片、高端数码新品主视觉的剪辑与色彩把控。建立并优化了达芬奇 DI 至 ACES 高规格色彩空间的高保真代理协作流程。",
        tags: ["剪辑指导", "达芬奇 DI", "ACES 色彩科学", "TVC 后期"]
      },
      {
        role: "影视后期总监",
        company: "StartupMedia",
        period: "2021 — 2023",
        desc: "负责线上多媒体产品包装与微电影后期流程。独立或协同交付 80 余支高质感商业短片，引入云端协作剪辑，让跨地域审片周期缩短 40%。",
        tags: ["后期总监", "三维动效包装", "云工作流", "AE 合成"]
      },
      {
        role: "自由职业剪辑师 / 独立后期",
        company: "独立制片与工作室协作",
        period: "2019 — 2021",
        desc: "为多家新锐潮牌、数码品牌提供前期创意与后期精剪一站式方案，擅长重节拍快节奏转场剪辑与叙事声音设计。",
        tags: ["独立制片", "街头蒙太奇", "声音设计", "创意短片"]
      }
    ],
    philosophies: [
      {
        emoji: "⚡",
        title: "节奏即灵魂",
        desc: "剪辑是对时间的微雕。切准那一帧画面的呼吸点，才能让故事在观众心里产生化学反应。"
      },
      {
        emoji: "🎨",
        title: "色彩传递情绪",
        desc: "调色不仅是色彩还原，更是通过冷暖虚实的色彩空间，潜意识引导剧情张力与氛围感。"
      },
      {
        emoji: "🔊",
        title: "声画不可分割",
        desc: "声音是画面的另一半翅膀。通过拟音与音效设计，让平面的屏幕呈现出三维物理深度。"
      }
    ]
  },
  admin: {
    username: "admin",
    passwordHash: "06bff6534b63ba2a13c446d41a36c52c9269fefb68cf96fbec792ddfac25e44b"
  }
}

export async function dbGetSiteConfig(event: H3Event): Promise<any> {
  const db = await getD1Database(event)
  if (db) {
    const row = await db.prepare('SELECT value FROM site_config WHERE key = ?').bind('site_config').first()
    if (row?.value) {
      return JSON.parse(row.value)
    }
    // Seed initial values in D1
    await db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)').bind('site_config', JSON.stringify(defaultConfig)).run()
    return defaultConfig
  }

  // Fallback
  const configPath = path.resolve(process.cwd(), 'content/site-config.json')
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(data)
    } else {
      const dir = path.dirname(configPath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8')
      return defaultConfig
    }
  } catch (error) {
    console.error('Failed to read config file:', error)
    return defaultConfig
  }
}

export async function dbSaveSiteConfig(event: H3Event, config: any): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    await db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)').bind('site_config', JSON.stringify(config)).run()
    return
  }

  // Fallback
  const configPath = path.resolve(process.cwd(), 'content/site-config.json')
  const dir = path.dirname(configPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}
