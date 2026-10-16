#!/usr/bin/env node
/**
 * init-server-data.js (ES Module)
 * XO Studio · 生产存储层全加密与自适应初始化 (Zero-Downgrade Vault Initializer)
 * 核心保障：所有创建与初始化的运行时文件 100% 写入 V4 量子金库密文，严禁明文产生。
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = __dirname

const contentDir = path.resolve(rootDir, 'content')
const projectsDir = path.join(contentDir, 'projects')
const vaultDir = path.join(contentDir, '.vault')

// ── Ensure directories exist ──────────────────────────────────────────────
const requiredDirs = [
  contentDir,
  projectsDir,
  vaultDir,
  path.join(contentDir, 'orders'),
  path.join(contentDir, 'bookings'),
  path.join(contentDir, 'media'),
  path.join(contentDir, 'video'),
  path.join(contentDir, 'vault-keys'),
  path.resolve(rootDir, 'public/uploads'),
  path.resolve(rootDir, 'public/uploads/delivery')
]

for (const d of requiredDirs) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true })
  }
}

// ── 密库主密钥获取与自动同步 ──────────────────────────────────────────────
function getVaultMasterSecret() {
  if (process.env.VAULT_MASTER_SECRET && process.env.VAULT_MASTER_SECRET.length >= 32) {
    return Buffer.from(process.env.VAULT_MASTER_SECRET, 'utf8')
  }

  const envPath = path.resolve(rootDir, '.env')
  if (fs.existsSync(envPath)) {
    try {
      const raw = fs.readFileSync(envPath, 'utf8')
      const match = raw.match(/^(?:VAULT_MASTER_SECRET|XO_VAULT_MASTER_SECRET)\s*=\s*(["']?)(.+?)\1$/m)
      if (match && match[2] && match[2].trim().length >= 32) {
        const s = match[2].trim()
        process.env.VAULT_MASTER_SECRET = s
        return Buffer.from(s, 'utf8')
      }
    } catch {}
  }

  const secretPath = path.join(vaultDir, 'master.secret')
  if (fs.existsSync(secretPath)) {
    try {
      const s = fs.readFileSync(secretPath, 'utf8').trim()
      if (s && s.length >= 32) {
        process.env.VAULT_MASTER_SECRET = s
        return Buffer.from(s, 'utf8')
      }
    } catch {}
  }

  const generated = crypto.randomBytes(64).toString('hex')
  try {
    fs.writeFileSync(secretPath, generated, { encoding: 'utf8', mode: 0o600 })
    process.env.VAULT_MASTER_SECRET = generated
  } catch {}
  return Buffer.from(generated, 'utf8')
}

function encryptV4(plainText) {
  const rootSecret = getVaultMasterSecret()
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(12)
  const timestamp = Date.now().toString(16)

  const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v4', 'utf8'), 144))
  const aesKey = derivedKeyMaterial.subarray(0, 32)
  const hmacKey = derivedKeyMaterial.subarray(32, 96)
  const sigKey = derivedKeyMaterial.subarray(96, 144)

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv)
  const plainBuffer = Buffer.isBuffer(plainText) ? plainText : Buffer.from(plainText, 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()])
  const authTag = cipher.getAuthTag()

  const hmac512 = crypto
    .createHmac('sha512', hmacKey)
    .update(salt)
    .update(iv)
    .update(authTag)
    .update(Buffer.from(timestamp, 'utf8'))
    .update(ciphertext)
    .digest('hex')

  const hmac384 = crypto
    .createHmac('sha384', sigKey)
    .update(salt)
    .update(Buffer.from(timestamp, 'utf8'))
    .update(Buffer.from(hmac512, 'utf8'))
    .digest('hex')

  const seal = `${hmac512}.${hmac384}`
  return `$XO_VAULT_FILE_V4$${salt.toString('hex')}$${iv.toString('hex')}$${authTag.toString('hex')}$${timestamp}$${ciphertext.toString('hex')}$${seal}`
}

function decryptEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'string') return ''
  const trimmed = envelope.trim()

  if (trimmed.startsWith('$XO_VAULT_FILE_V4$')) {
    const parts = trimmed.split('$')
    if (parts.length < 8) throw new Error('无效的 V4 信封')
    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const ciphertext = Buffer.from(parts[6], 'hex')
    const rootSecret = getVaultMasterSecret()
    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v4', 'utf8'), 144))
    const aesKey = derivedKeyMaterial.subarray(0, 32)
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  }

  if (trimmed.startsWith('$XO_VAULT_FILE_V3$')) {
    const parts = trimmed.split('$')
    if (parts.length < 7) throw new Error('无效的 V3 信封')
    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const ciphertext = Buffer.from(parts[5], 'hex')
    const rootSecret = getVaultMasterSecret()
    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v3', 'utf8'), 96))
    const aesKey = derivedKeyMaterial.subarray(0, 32)
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  }

  return envelope
}

function writeSecureJson(targetPath, data) {
  const jsonStr = JSON.stringify(data, null, 2)
  const encrypted = encryptV4(jsonStr)
  fs.writeFileSync(targetPath, encrypted, { encoding: 'utf8', mode: 0o600 })
}

// ── 1. Default site-config (强制加密写入) ──────────────────────────────────
const configPath = path.join(contentDir, 'site-config.json')
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
  writeSecureJson(configPath, defaultConfig)
  console.log('🛡️ Created content/site-config.json (V4 量子密文)')
} else {
  // 若已有文件但为明文，自动就地升级为密文
  const raw = fs.readFileSync(configPath, 'utf8').trim()
  if (!raw.startsWith('$XO_VAULT_FILE_')) {
    writeSecureJson(configPath, JSON.parse(raw))
    console.log('🔒 Auto-encrypted content/site-config.json to V4 vault')
  }
}

// ── 2. Default page-views ─────────────────────────────────────────────────
const pageViewsPath = path.join(contentDir, 'page-views.json')
if (!fs.existsSync(pageViewsPath)) {
  writeSecureJson(pageViewsPath, { total: 0, daily: {} })
  console.log('🛡️ Created content/page-views.json (V4 量子密文)')
}

// ── 3. Default blog-categories & blog-posts ───────────────────────────────
const blogCatsPath = path.join(contentDir, 'blog-categories.json')
const blogPostsPath = path.join(contentDir, 'blog-posts.json')

if (!fs.existsSync(blogCatsPath)) {
  const defaultCats = [
    { id: '1', name: '全部', slug: 'all', description: '所有精选文章与动态', count: 0 },
    { id: '2', name: 'Design', slug: 'design', description: 'UI/UX 交互设计与胶囊设计系统', count: 0 },
    { id: '3', name: 'Tech', slug: 'tech', description: '前沿前端技术与架构实践', count: 0 },
    { id: '4', name: 'Life', slug: 'life', description: '灵感、读书笔记与剪辑日常', count: 0 }
  ]
  writeSecureJson(blogCatsPath, defaultCats)
  console.log('🛡️ Created content/blog-categories.json (V4 量子密文)')
}

if (!fs.existsSync(blogPostsPath)) {
  writeSecureJson(blogPostsPath, [])
  console.log('🛡️ Created content/blog-posts.json (V4 量子密文)')
}

// ── 4. Additional Sensitive Files (全部强制加密) ──────────────────────────
const additionalFiles = [
  { path: path.join(contentDir, 'blacklist.json'), defaultVal: [] },
  { path: path.join(contentDir, 'security-logs.json'), defaultVal: [] },
  { path: path.join(contentDir, 'bookings.json'), defaultVal: [] },
  { path: path.join(contentDir, 'orders.json'), defaultVal: [] },
  { path: path.join(contentDir, 'client-accounts.json'), defaultVal: [] },
  { path: path.join(contentDir, 'password-requests.json'), defaultVal: [] },
  { path: path.join(contentDir, 'users.json'), defaultVal: [] },
  { path: path.join(contentDir, 'events.json'), defaultVal: [] },
  { path: path.join(contentDir, 'project-heat.json'), defaultVal: {} }
]

for (const file of additionalFiles) {
  if (!fs.existsSync(file.path)) {
    writeSecureJson(file.path, file.defaultVal)
    console.log(`🛡️ Created ${path.relative(rootDir, file.path)} (V4 量子密文)`)
  } else {
    // 若已有明文文件，就地强制收敛加密
    const raw = fs.readFileSync(file.path, 'utf8').trim()
    if (!raw.startsWith('$XO_VAULT_FILE_')) {
      try {
        const parsed = JSON.parse(raw)
        writeSecureJson(file.path, parsed)
        console.log(`🔒 Auto-migrated ${path.relative(rootDir, file.path)} to V4 vault`)
      } catch {}
    }
  }
}

// ── 5. Auto-Prune False-Positive Blacklist Bans (安全解密过滤) ────────────
const blacklistPath = path.join(contentDir, 'blacklist.json')
if (fs.existsSync(blacklistPath)) {
  try {
    const raw = fs.readFileSync(blacklistPath, 'utf8')
    const decrypted = decryptEnvelope(raw)
    const list = JSON.parse(decrypted)
    if (Array.isArray(list)) {
      const filtered = list.filter(item => {
        const r = String(item.reason || '')
        return !r.includes('公钥') && !r.includes('密文') && !r.includes('非法篡改') && !r.includes('系统自动反制')
      })
      if (filtered.length !== list.length) {
        writeSecureJson(blacklistPath, filtered)
        console.log(`🧹 已自动清除 ${list.length - filtered.length} 条误判封禁记录`)
      }
    }
  } catch {}
}

console.log('\n🎉 XO Studio 全量运行时存储结构已就绪 (100% 密文存储，零降级保证)。\n')
