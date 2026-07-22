import { H3Event } from 'h3'
import fs from 'node:fs'
import path from 'node:path'
import { getRuntimeDataPath } from './storage'

let isDbInitialized = false
const MAX_PROJECT_VIDEOS = 10

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
          videoUrls TEXT,
          software TEXT,
          tags TEXT,
          featured INTEGER DEFAULT 0,
          description TEXT,
          longDescription TEXT,
          workflow TEXT,
          password TEXT,
          releaseYear TEXT,
          postSpecs TEXT,
          director TEXT,
          deliverFormat TEXT,
          audioFormat TEXT,
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
        CREATE TABLE IF NOT EXISTS password_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clientName TEXT NOT NULL,
          contact TEXT NOT NULL,
          projectSlug TEXT NOT NULL,
          projectTitle TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'client',
          allowedProjects TEXT DEFAULT '',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `)
      // Try to alter table in case the schema already existed without the password and imageBefore columns
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN password TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN imageBefore TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN videoUrls TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN releaseYear TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN postSpecs TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN director TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN deliverFormat TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE projects ADD COLUMN audioFormat TEXT;`)
      } catch (e) {}
      try {
        await db.exec(`ALTER TABLE users ADD COLUMN allowedProjects TEXT DEFAULT '';`)
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
      if (trimmed.startsWith('-') && currentKey && !/^-\s*[\w-]+\s*:/.test(trimmed)) {
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

    if (trimmed.startsWith('-') && currentKey && !/^-\s*[\w-]+\s*:/.test(trimmed)) {
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

function parseVideoUrlsInput(input: any): any[] {
  if (Array.isArray(input)) return input
  if (typeof input !== 'string') return []

  const trimmed = input.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed
  } catch (e) {}

  return trimmed.split(/[\n,，]+/g)
}

function normalizeVideoUrls(data: any): string[] {
  const urls = parseVideoUrlsInput(data?.videoUrls)
  const normalized = urls
    .map((url: any) => String(url || '').trim())
    .filter(Boolean)

  const legacyUrl = String(data?.videoUrl || '').trim()
  if (legacyUrl && !normalized.includes(legacyUrl)) normalized.unshift(legacyUrl)
  return normalized.slice(0, MAX_PROJECT_VIDEOS)
}

function normalizeProject(row: any) {
  const videoUrls = normalizeVideoUrls(row)
  return {
    ...row,
    videoUrls,
    videoUrl: row.videoUrl || videoUrls[0] || ''
  }
}

function parseJsonArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

function stringifyYaml(data: any): string {
  const lines = []
  lines.push(`title: "${(data.title || '').replace(/"/g, '\\"')}"`)
  lines.push(`description: "${(data.description || '').replace(/"/g, '\\"')}"`)
  lines.push(`longDescription: "${(data.longDescription || '').replace(/"/g, '\\"')}"`)
  lines.push(`image: "${(data.image || '').replace(/"/g, '\\"')}"`)
  lines.push(`videoUrl: "${(data.videoUrl || '').replace(/"/g, '\\"')}"`)
  if (Array.isArray(data.videoUrls)) {
    lines.push('videoUrls:')
    normalizeVideoUrls(data).forEach((url: string) => {
      lines.push(`  - "${url.replace(/"/g, '\\"')}"`)
    })
  } else {
    lines.push('videoUrls: []')
  }
  lines.push(`password: "${(data.password || '').replace(/"/g, '\\"')}"`)
  lines.push(`imageBefore: "${(data.imageBefore || '').replace(/"/g, '\\"')}"`)
  lines.push(`releaseYear: "${(data.releaseYear || '').replace(/"/g, '\\"')}"`)
  lines.push(`postSpecs: "${(data.postSpecs || '').replace(/"/g, '\\"')}"`)
  lines.push(`director: "${(data.director || '').replace(/"/g, '\\"')}"`)
  lines.push(`deliverFormat: "${(data.deliverFormat || '').replace(/"/g, '\\"')}"`)
  lines.push(`audioFormat: "${(data.audioFormat || '').replace(/"/g, '\\"')}"`)
  
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

/** Strip password from a project row, replacing it with a hasPassword boolean */
function sanitizeProject(row: any) {
  const { password, ...rest } = row
  return {
    ...normalizeProject(rest),
    hasPassword: !!(password && String(password).trim() !== '')
  }
}

export async function dbGetProjects(event: H3Event): Promise<any[]> {
  const projects = await dbGetProjectsRaw(event)
  return projects.map((project: any) => sanitizeProject(project))
}

/** Admin-only project list: includes raw password for editing and lock overview. */
export async function dbGetProjectsRaw(event: H3Event): Promise<any[]> {
  const db = await getD1Database(event)
  if (db) {
    const { results } = await db.prepare('SELECT * FROM projects ORDER BY featured DESC, createdAt DESC').all()
    return results.map((row: any) => ({
      ...row,
      featured: Boolean(row.featured),
      videoUrls: parseJsonArray(row.videoUrls),
      software: parseJsonArray(row.software),
      tags: parseJsonArray(row.tags),
      workflow: parseJsonArray(row.workflow)
    })).map(normalizeProject)
  }

  // Fallback: local markdown files
  const projectsDir = getRuntimeDataPath('projects')
  if (!fs.existsSync(projectsDir)) return []
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'))
  const projects = files.map(file => normalizeProject(parseMarkdownFile(path.join(projectsDir, file))))
  return projects.sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
}

/** Server-side only: retrieve raw password for unlock verification */
export async function dbGetProjectPassword(event: H3Event, slug: string): Promise<string | null> {
  const db = await getD1Database(event)
  if (db) {
    const row = await db.prepare('SELECT password FROM projects WHERE slug = ?').bind(slug).first() as any
    return row?.password || null
  }
  const filePath = getRuntimeDataPath('projects', `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const parsed = parseMarkdownFile(filePath)
  return (parsed as any).password || null
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
      INSERT INTO projects (
        slug, title, image, imageBefore, videoUrl, videoUrls, software, tags, featured, 
        description, longDescription, workflow, password,
        releaseYear, postSpecs, director, deliverFormat, audioFormat
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.slug,
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || normalizeVideoUrls(body)[0] || '',
      JSON.stringify(normalizeVideoUrls(body)),
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || '',
      body.releaseYear || '',
      body.postSpecs || '',
      body.director || '',
      body.deliverFormat || '',
      body.audioFormat || ''
    ).run()
    return
  }

  // Fallback
  const projectsDir = getRuntimeDataPath('projects')
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
      SET title = ?, image = ?, imageBefore = ?, videoUrl = ?, videoUrls = ?, software = ?, tags = ?, featured = ?, 
          description = ?, longDescription = ?, workflow = ?, password = ?,
          releaseYear = ?, postSpecs = ?, director = ?, deliverFormat = ?, audioFormat = ?
      WHERE slug = ?
    `).bind(
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || normalizeVideoUrls(body)[0] || '',
      JSON.stringify(normalizeVideoUrls(body)),
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || '',
      body.releaseYear || '',
      body.postSpecs || '',
      body.director || '',
      body.deliverFormat || '',
      body.audioFormat || '',
      body.slug
    ).run()
    return
  }

  // Fallback
  const projectsDir = getRuntimeDataPath('projects')
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
  const projectsDir = getRuntimeDataPath('projects')
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
    label: "AMBIENT AUDIO",
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
  const configPath = getRuntimeDataPath('site-config.json')
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8')
      const parsed = JSON.parse(data)
      if (!parsed.emailSettings) {
        parsed.emailSettings = {
          enabled: false,
          smtpHost: 'smtp.qq.com',
          smtpPort: 465,
          smtpSecure: true,
          smtpUser: '',
          smtpPass: '',
          senderName: 'Xo Studio',
          senderEmail: ''
        }
      } else if (parsed.emailSettings.senderEmail === undefined) {
        parsed.emailSettings.senderEmail = ''
      }
      return parsed
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
  const configPath = getRuntimeDataPath('site-config.json')
  const dir = path.dirname(configPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

export async function dbGetPasswordRequests(event: H3Event): Promise<any[]> {
  const db = await getD1Database(event)
  if (db) {
    const { results } = await db.prepare('SELECT * FROM password_requests ORDER BY createdAt DESC').all()
    return results
  }
  
  // Local fallback JSON file
  const requestsPath = getRuntimeDataPath('password-requests.json')
  if (!fs.existsSync(requestsPath)) return []
  try {
    const raw = fs.readFileSync(requestsPath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

export async function dbCreatePasswordRequest(event: H3Event, data: any): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    await db.prepare(`
      INSERT INTO password_requests (clientName, contact, projectSlug, projectTitle, status, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(data.clientName, data.contact, data.projectSlug, data.projectTitle, data.status || 'pending', data.reason || '').run()
    return
  }

  // Local fallback JSON file
  const requestsPath = getRuntimeDataPath('password-requests.json')
  let requests = []
  if (fs.existsSync(requestsPath)) {
    try {
      requests = JSON.parse(fs.readFileSync(requestsPath, 'utf-8'))
    } catch (e) {}
  }
  const newRequest = {
    id: Date.now(),
    clientName: data.clientName,
    contact: data.contact,
    projectSlug: data.projectSlug,
    projectTitle: data.projectTitle,
    status: data.status || 'pending',
    clientUsername: data.clientUsername || '',
    reason: data.reason || '',
    createdAt: new Date().toISOString()
  }
  requests.unshift(newRequest)
  fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2), 'utf-8')
}

export async function dbUpdatePasswordRequestStatus(event: H3Event, id: number | string, status: string): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    await db.prepare('UPDATE password_requests SET status = ? WHERE id = ?').bind(status, id).run()
    return
  }

  // Local fallback JSON file
  const requestsPath = getRuntimeDataPath('password-requests.json')
  if (!fs.existsSync(requestsPath)) return
  try {
    const requests = JSON.parse(fs.readFileSync(requestsPath, 'utf-8'))
    const idx = requests.findIndex((r: any) => String(r.id) === String(id))
    if (idx !== -1) {
      requests[idx].status = status
      fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2), 'utf-8')
    }
  } catch (e) {}
}

export async function dbDeletePasswordRequest(event: H3Event, id: number | string): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    await db.prepare('DELETE FROM password_requests WHERE id = ?').bind(id).run()
    return
  }

  // Local fallback JSON file
  const requestsPath = getRuntimeDataPath('password-requests.json')
  if (!fs.existsSync(requestsPath)) return
  try {
    let requests = JSON.parse(fs.readFileSync(requestsPath, 'utf-8'))
    requests = requests.filter((r: any) => String(r.id) !== String(id))
    fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2), 'utf-8')
  } catch (e) {}
}

export async function dbGetUsers(event: H3Event): Promise<any[]> {
  const db = await getD1Database(event)
  if (db) {
    const { results } = await db.prepare('SELECT id, username, email, role, allowedProjects, createdAt FROM users ORDER BY createdAt DESC').all()
    return results
  }

  // Local fallback JSON file
  const usersPath = getRuntimeDataPath('users.json')
  if (!fs.existsSync(usersPath)) return []
  try {
    const raw = fs.readFileSync(usersPath, 'utf-8')
    const users = JSON.parse(raw)
    // Strip passwords for safety in query list
    return users.map(({ password, ...rest }: any) => rest)
  } catch (e) {
    return []
  }
}

export async function dbCreateUser(event: H3Event, data: any): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    // Check duplicate
    const duplicate = await db.prepare('SELECT id FROM users WHERE username = ?').bind(data.username).first()
    if (duplicate) {
      throw createError({ statusCode: 409, statusMessage: '用户名已被注册。' })
    }
    await db.prepare(`
      INSERT INTO users (username, email, password, role, allowedProjects)
      VALUES (?, ?, ?, ?, '')
    `).bind(data.username, data.email, data.password, data.role || 'client').run()
    return
  }

  // Local fallback JSON file
  const usersPath = getRuntimeDataPath('users.json')
  let users = []
  if (fs.existsSync(usersPath)) {
    try {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    } catch (e) {}
  }
  const duplicate = users.find((u: any) => u.username === data.username)
  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: '用户名已被注册。' })
  }
  const newUser = {
    id: Date.now(),
    username: data.username,
    email: data.email,
    wechat: data.wechat || '',
    password: data.password,
    role: data.role || 'client',
    allowedProjects: '',
    createdAt: new Date().toISOString()
  }
  users.unshift(newUser)
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8')
}

export async function dbDeleteUser(event: H3Event, id: number | string): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    return
  }

  // Local fallback JSON file
  const usersPath = getRuntimeDataPath('users.json')
  if (!fs.existsSync(usersPath)) return
  try {
    let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    users = users.filter((u: any) => String(u.id) !== String(id))
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8')
  } catch (e) {}
}

export async function dbUpdateUser(event: H3Event, id: number | string, data: any): Promise<void> {
  const db = await getD1Database(event)
  if (db) {
    if (data.password) {
      await db.prepare(`
        UPDATE users 
        SET email = ?, role = ?, allowedProjects = ?, password = ?, isWhitelisted = ?, isBlacklisted = ?
        WHERE id = ?
      `).bind(data.email, data.role, data.allowedProjects || '', data.password, data.isWhitelisted ? 1 : 0, data.isBlacklisted ? 1 : 0, id).run()
    } else {
      await db.prepare(`
        UPDATE users 
        SET email = ?, role = ?, allowedProjects = ?, isWhitelisted = ?, isBlacklisted = ?
        WHERE id = ?
      `).bind(data.email, data.role, data.allowedProjects || '', data.isWhitelisted ? 1 : 0, data.isBlacklisted ? 1 : 0, id).run()
    }
    return
  }

  // Local fallback JSON file
  const usersPath = getRuntimeDataPath('users.json')
  if (!fs.existsSync(usersPath)) return
  try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    const idx = users.findIndex((u: any) => String(u.id) === String(id))
    if (idx !== -1) {
      users[idx].email = data.email
      users[idx].wechat = data.wechat || ''
      users[idx].role = data.role
      users[idx].allowedProjects = data.allowedProjects || ''
      if (data.isWhitelisted !== undefined) users[idx].isWhitelisted = !!data.isWhitelisted
      if (data.isBlacklisted !== undefined) users[idx].isBlacklisted = !!data.isBlacklisted
      if (data.password) {
        users[idx].password = data.password
      }
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8')
    }
  } catch (e) {}
}

// Blacklist & Whitelist Management Helpers
export async function dbGetBlacklist(event: H3Event): Promise<any[]> {
  const blacklistPath = getRuntimeDataPath('blacklist.json')
  if (!fs.existsSync(blacklistPath)) return []
  try {
    return JSON.parse(fs.readFileSync(blacklistPath, 'utf-8'))
  } catch (e) {
    return []
  }
}

export async function dbAddBlacklist(event: H3Event, item: { type?: string; value: string; reason?: string }): Promise<void> {
  const blacklistPath = getRuntimeDataPath('blacklist.json')
  let list = await dbGetBlacklist(event)
  const val = item.value.trim()
  if (!val) return
  const exists = list.find((b: any) => b.value.toLowerCase() === val.toLowerCase())
  if (!exists) {
    list.unshift({
      id: Date.now(),
      type: item.type || 'contact',
      value: val,
      reason: item.reason || '管理员手动拉黑',
      createdAt: new Date().toISOString()
    })
    const dir = path.dirname(blacklistPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2), 'utf-8')
  }
}

export async function dbRemoveBlacklist(event: H3Event, value: string): Promise<void> {
  const blacklistPath = getRuntimeDataPath('blacklist.json')
  let list = await dbGetBlacklist(event)
  const val = value.trim().toLowerCase()
  list = list.filter((b: any) => (b.value || '').toLowerCase() !== val)
  const dir = path.dirname(blacklistPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(blacklistPath, JSON.stringify(list, null, 2), 'utf-8')
}

export async function dbCheckRateLimitAndBlacklist(event: H3Event, params: { username?: string; contact?: string; ip?: string }): Promise<{ isWhitelisted: boolean; isBlacklisted: boolean; isAutoBlacklisted?: boolean; reason: string }> {
  const { username = '', contact = '', ip = '' } = params

  // 1. Check registered user whitelist / blacklist
  if (username) {
    const users = await dbGetUsers(event)
    const u = users.find((user: any) => user.username === username)
    if (u) {
      if (u.isWhitelisted) {
        return { isWhitelisted: true, isBlacklisted: false, reason: '白名单客户豁免防刷保护' }
      }
      if (u.isBlacklisted) {
        return { isWhitelisted: false, isBlacklisted: true, reason: '客户账号已被拉黑' }
      }
    }
  }

  // 2. Check blacklist.json
  const blacklist = await dbGetBlacklist(event)
  const targets = [username, contact, ip].filter(Boolean).map(s => s.toLowerCase())
  
  for (const b of blacklist) {
    const bVal = (b.value || '').toLowerCase()
    if (bVal && targets.some(t => t.includes(bVal) || bVal.includes(t))) {
      return { isWhitelisted: false, isBlacklisted: true, reason: b.reason || '已在黑名单记录中' }
    }
  }

  // 3. Rate limiting check (past 10 minutes, >= 3 requests)
  const requests = await dbGetPasswordRequests(event)
  const tenMinsAgo = Date.now() - 10 * 60 * 1000

  const recent = requests.filter((r: any) => {
    const reqTime = new Date(r.createdAt || 0).getTime()
    if (reqTime < tenMinsAgo) return false
    
    if (username && r.clientUsername === username) return true
    if (contact && r.contact && r.contact.includes(contact)) return true
    if (ip && r.contact && r.contact.includes(ip)) return true
    return false
  })

  if (recent.length >= 3) {
    // Auto-blacklist
    const autoVal = username || contact || ip || 'unknown'
    const reason = '频繁申请密码防刷保护机制触发，系统自动拉黑'
    await dbAddBlacklist(event, { type: 'auto', value: autoVal, reason })
    return { isWhitelisted: false, isBlacklisted: true, isAutoBlacklisted: true, reason }
  }

  return { isWhitelisted: false, isBlacklisted: false, reason: '' }
}
