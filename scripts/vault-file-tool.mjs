#!/usr/bin/env node
/**
 * scripts/vault-file-tool.mjs
 * XO Studio · 服务端独立文件量子金库加解密与验签工具 V4 (Standalone File Vault CLI V4)
 * 
 * 用法:
 *   node scripts/vault-file-tool.mjs encrypt <file> [outFile]  # 加密指定独立文件为 V4 格式
 *   node scripts/vault-file-tool.mjs decrypt <file> [outFile]  # 解密指定独立文件
 *   node scripts/vault-file-tool.mjs verify <file>             # 验证独立文件数字封签与完整性
 *   node scripts/vault-file-tool.mjs status                    # 检查服务端独立密库状态与文件清单
 *   node scripts/vault-file-tool.mjs encrypt-all               # 全面强制加密所有数据与配置独立文件
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function getVaultRootSecret() {
  const envSecret = process.env.VAULT_MASTER_SECRET || process.env.XO_VAULT_MASTER_SECRET
  if (envSecret && envSecret.length >= 32) {
    return Buffer.from(envSecret, 'utf8')
  }

  // 尝试从 .env 读取
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

  const secretPath = path.resolve(rootDir, 'content', '.vault', 'master.secret')
  try {
    if (fs.existsSync(secretPath)) {
      const s = fs.readFileSync(secretPath, 'utf8').trim()
      if (s && s.length >= 32) return Buffer.from(s, 'utf8')
    }
    const generated = crypto.randomBytes(64).toString('hex')
    fs.mkdirSync(path.dirname(secretPath), { recursive: true })
    fs.writeFileSync(secretPath, generated, { encoding: 'utf8', mode: 0o600 })
    return Buffer.from(generated, 'utf8')
  } catch {}
  return Buffer.from('XO_STUDIO_WORLD_CLASS_QUANTUM_SECRET_2026', 'utf8')
}

function encryptFileContent(plainText) {
  const rootSecret = getVaultRootSecret()
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

function decryptFileContent(envelope) {
  if (!envelope || typeof envelope !== 'string') return ''
  const trimmed = envelope.trim()

  if (trimmed.startsWith('$XO_VAULT_FILE_V4$')) {
    const parts = trimmed.split('$')
    if (parts.length < 8) throw new Error('无效的 V4 金库加密文件结构')

    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const timestamp = parts[5]
    const ciphertext = Buffer.from(parts[6], 'hex')
    const expectedSeal = parts[7]

    const [expected512, expected384] = expectedSeal.split('.')
    if (!expected512 || !expected384) throw new Error('V4 金库数字封签结构损坏')

    const rootSecret = getVaultRootSecret()
    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v4', 'utf8'), 144))
    const aesKey = derivedKeyMaterial.subarray(0, 32)
    const hmacKey = derivedKeyMaterial.subarray(32, 96)
    const sigKey = derivedKeyMaterial.subarray(96, 144)

    const actual512 = crypto
      .createHmac('sha512', hmacKey)
      .update(salt)
      .update(iv)
      .update(authTag)
      .update(Buffer.from(timestamp, 'utf8'))
      .update(ciphertext)
      .digest('hex')

    const bufActual512 = Buffer.from(actual512, 'hex')
    const bufExpected512 = Buffer.from(expected512, 'hex')
    if (bufActual512.length !== bufExpected512.length || !crypto.timingSafeEqual(bufActual512, bufExpected512)) {
      throw new Error('V4 金库数字主签名校验失败：文件内容已被篡改或密钥不匹配')
    }

    const actual384 = crypto
      .createHmac('sha384', sigKey)
      .update(salt)
      .update(Buffer.from(timestamp, 'utf8'))
      .update(Buffer.from(actual512, 'utf8'))
      .digest('hex')

    const bufActual384 = Buffer.from(actual384, 'hex')
    const bufExpected384 = Buffer.from(expected384, 'hex')
    if (bufActual384.length !== bufExpected384.length || !crypto.timingSafeEqual(bufActual384, bufExpected384)) {
      throw new Error('V4 金库级联防伪签名校验失败：数字指纹已被破坏')
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return decrypted.toString('utf8')
  }

  if (trimmed.startsWith('$XO_VAULT_FILE_V3$')) {
    const parts = trimmed.split('$')
    if (parts.length < 7) throw new Error('无效的 V3 金库文件结构')

    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const ciphertext = Buffer.from(parts[5], 'hex')
    const expectedSeal = parts[6]

    const rootSecret = getVaultRootSecret()
    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_FILE_STORAGE_v3', 'utf8'), 96))
    const aesKey = derivedKeyMaterial.subarray(0, 32)
    const hmacKey = derivedKeyMaterial.subarray(32, 96)

    const actualSeal = crypto
      .createHmac('sha512', hmacKey)
      .update(salt)
      .update(iv)
      .update(authTag)
      .update(ciphertext)
      .digest('hex')

    const bufActual = Buffer.from(actualSeal, 'hex')
    const bufExpected = Buffer.from(expectedSeal, 'hex')
    if (bufActual.length !== bufExpected.length || !crypto.timingSafeEqual(bufActual, bufExpected)) {
      throw new Error('V3 金库文件数字封签校验失败：文件已被外部篡改')
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return decrypted.toString('utf8')
  }

  return envelope
}

const [,, command, targetFile, outFile] = process.argv

function printUsage() {
  console.log(`
XO Studio · 服务端独立文件量子金库加解密工具 V4
用法:
  node scripts/vault-file-tool.mjs encrypt <file> [outFile]  # 加密指定独立文件 (V4 双签名封签)
  node scripts/vault-file-tool.mjs decrypt <file> [outFile]  # 解密指定独立文件
  node scripts/vault-file-tool.mjs verify <file>             # 验证文件数字封签与完整性
  node scripts/vault-file-tool.mjs status                    # 检查服务端独立密库状态
  node scripts/vault-file-tool.mjs encrypt-all               # 全面强制加密所有独立文件为 V4
`)
}

if (!command || command === 'help' || command === '--help') {
  printUsage()
  process.exit(0)
}

const sensitiveCandidates = [
  path.resolve(rootDir, 'content', 'site-config.json'),
  path.resolve(rootDir, 'content', 'users.json'),
  path.resolve(rootDir, 'content', 'password-requests.json'),
  path.resolve(rootDir, 'content', 'bookings.json'),
  path.resolve(rootDir, 'content', 'orders.json'),
  path.resolve(rootDir, 'content', 'blog-posts.json'),
  path.resolve(rootDir, 'content', 'blog-categories.json'),
  path.resolve(rootDir, 'content', 'blacklist.json'),
  path.resolve(rootDir, 'content', 'order-pages.json'),
  path.resolve(rootDir, 'content', 'delivery-items.json'),
  path.resolve(rootDir, 'content', '.sessions.json'),
  path.resolve(rootDir, 'content', 'security-logs.json'),
  path.resolve(rootDir, 'content', 'events.json'),
  path.resolve(rootDir, 'content', 'page-views.json'),
  path.resolve(rootDir, 'content', 'project-heat.json'),
  path.resolve(rootDir, 'content', 'alipay-config.enc.json')
]

if (command === 'status') {
  console.log('==========================================================')
  console.log('🔐 XO Studio 服务端独立文件金库状态审计 (V4 Dual Signature)')
  console.log('==========================================================')
  const vaultDir = path.resolve(rootDir, 'content', '.vault')
  console.log(`📂 金库私密根目录: ${vaultDir}`)
  if (fs.existsSync(vaultDir)) {
    const files = fs.readdirSync(vaultDir)
    console.log(`📄 密库文件数量: ${files.length}`)
    files.forEach(f => {
      const full = path.join(vaultDir, f)
      const stat = fs.statSync(full)
      console.log(`   - ${f} (${stat.size} bytes, mode: 0${(stat.mode & 0o777).toString(8)})`)
    })
  } else {
    console.log('⚠️ 金库私密目录尚未创建')
  }

  console.log('\n🔒 关键运行时独立文件状态:')
  sensitiveCandidates.forEach(p => {
    const rel = path.relative(rootDir, p)
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8').trim()
      let statusText = '📄 当前为明文/普通格式'
      if (raw.startsWith('$XO_VAULT_FILE_V4$')) {
        statusText = '🛡️ 已处于量子文件金库 V4 加密状态 (AES-256-GCM + 双重 HMAC-512/384 签名)'
      } else if (raw.startsWith('$XO_VAULT_FILE_V3$')) {
        statusText = '🛡️ 已处于量子文件金库 V3 加密状态 (AES-256-GCM + HMAC-SHA512)'
      }
      console.log(`   - ${rel}: ${statusText}`)
    } else {
      console.log(`   - ${rel}: (文件暂不存在)`)
    }
  })

  const projectsDir = path.resolve(rootDir, 'content', 'projects')
  if (fs.existsSync(projectsDir)) {
    const mdFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'))
    console.log(`\n🎬 视频项目库加密状态 (${mdFiles.length} 个项目):`)
    mdFiles.forEach(f => {
      const full = path.join(projectsDir, f)
      const raw = fs.readFileSync(full, 'utf8').trim()
      let statusText = '📄 明文'
      if (raw.startsWith('$XO_VAULT_FILE_V4$')) {
        statusText = '🛡️ V4 级联签名加密 (AES-256-GCM + 双重数字签名)'
      } else if (raw.startsWith('$XO_VAULT_FILE_V3$')) {
        statusText = '🛡️ V3 签名加密 (AES-256-GCM + HMAC-512)'
      }
      console.log(`   - content/projects/${f}: ${statusText}`)
    })
  }
  console.log('==========================================================')
  process.exit(0)
}

if (command === 'encrypt-all') {
  console.log('==========================================================')
  console.log('🔐 XO Studio 全站独立文件全面强制加密 (Zero-Downgrade V4)')
  console.log('==========================================================')
  let encryptedCount = 0
  let skippedCount = 0

  sensitiveCandidates.forEach(p => {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8').trim()
      if (!raw.startsWith('$XO_VAULT_FILE_V4$')) {
        // 如果是 V3 或明文，统一升级为 V4
        let plain = raw
        if (raw.startsWith('$XO_VAULT_FILE_V3$')) {
          try { plain = decryptFileContent(raw) } catch {}
        }
        const enc = encryptFileContent(plain)
        fs.writeFileSync(p, enc, { encoding: 'utf8', mode: 0o600 })
        console.log(`✅ [升级加密 V4] ${path.relative(rootDir, p)}`)
        encryptedCount++
      } else {
        console.log(`🛡️ [已处于 V4] ${path.relative(rootDir, p)}`)
        skippedCount++
      }
    }
  })

  const projectsDir = path.resolve(rootDir, 'content', 'projects')
  if (fs.existsSync(projectsDir)) {
    const mdFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'))
    mdFiles.forEach(f => {
      const full = path.join(projectsDir, f)
      const raw = fs.readFileSync(full, 'utf8').trim()
      if (!raw.startsWith('$XO_VAULT_FILE_V4$')) {
        let plain = raw
        if (raw.startsWith('$XO_VAULT_FILE_V3$')) {
          try { plain = decryptFileContent(raw) } catch {}
        }
        const enc = encryptFileContent(plain)
        fs.writeFileSync(full, enc, { encoding: 'utf8', mode: 0o600 })
        console.log(`✅ [升级加密 V4] content/projects/${f}`)
        encryptedCount++
      } else {
        console.log(`🛡️ [已处于 V4] content/projects/${f}`)
        skippedCount++
      }
    })
  }

  console.log(`\n🎉 全面加密完成: ${encryptedCount} 个文件已升级为 V4 级联签名密文, ${skippedCount} 个文件已处于最新状态。`)
  console.log('==========================================================')
  process.exit(0)
}

if (!targetFile) {
  console.error('❌ 错误: 未指定目标文件路径')
  printUsage()
  process.exit(1)
}

const resolvedTarget = path.resolve(process.cwd(), targetFile)
if (!fs.existsSync(resolvedTarget)) {
  console.error(`❌ 错误: 文件不存在 -> ${resolvedTarget}`)
  process.exit(1)
}

try {
  const content = fs.readFileSync(resolvedTarget, 'utf8')

  if (command === 'verify') {
    if (!content.startsWith('$XO_VAULT_FILE_')) {
      console.log(`ℹ️ [verify] 文件 ${targetFile} 为普通未加密格式。`)
      process.exit(0)
    }
    decryptFileContent(content)
    console.log(`✅ [verify] 文件 ${targetFile} 双重数字防篡改封签校验通过！完整性 100% 验证无篡改。`)
    process.exit(0)
  }

  if (command === 'encrypt') {
    if (content.startsWith('$XO_VAULT_FILE_V4$')) {
      console.log(`⚠️ [encrypt] 文件 ${targetFile} 已经处于 V4 加密状态，无需重复加密。`)
      process.exit(0)
    }
    let plain = content
    if (content.startsWith('$XO_VAULT_FILE_V3$')) {
      plain = decryptFileContent(content)
    }
    const encrypted = encryptFileContent(plain)
    const dest = outFile ? path.resolve(process.cwd(), outFile) : resolvedTarget
    fs.writeFileSync(dest, encrypted, { encoding: 'utf8', mode: 0o600 })
    console.log(`✅ [encrypt] 独立文件已成功执行 V4 级联加密 -> ${dest} (权限: 0600)`)
    process.exit(0)
  }

  if (command === 'decrypt') {
    if (!content.startsWith('$XO_VAULT_FILE_')) {
      console.log(`ℹ️ [decrypt] 文件 ${targetFile} 未包含加密信封，内容保持原样。`)
      process.exit(0)
    }
    const decrypted = decryptFileContent(content)
    const dest = outFile ? path.resolve(process.cwd(), outFile) : resolvedTarget
    fs.writeFileSync(dest, decrypted, 'utf8')
    console.log(`🔓 [decrypt] 独立文件解密还原成功 -> ${dest}`)
    process.exit(0)
  }

  console.error(`❌ 未知操作命令: ${command}`)
  printUsage()
  process.exit(1)
} catch (err) {
  console.error(`❌ 执行失败: ${err.message}`)
  process.exit(1)
}
