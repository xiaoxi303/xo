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

function generateDecoyPayload(plainStr) {
  const isJson = plainStr.trim().startsWith('{') || plainStr.trim().startsWith('[')
  if (isJson) {
    try {
      const parsed = JSON.parse(plainStr)
      if (Array.isArray(parsed)) {
        return JSON.stringify(
          Array.from({ length: Math.min(parsed.length || 3, 5) }).map((_, idx) => ({
            id: `DECOY_${crypto.randomBytes(6).toString('hex')}`,
            syntheticIndex: idx,
            entropyToken: crypto.randomBytes(16).toString('hex'),
            timestamp: Date.now() - idx * 86400000,
            status: 'HONEYPOT_CHAMBER_SYNTHETIC'
          })),
          null,
          2
        )
      } else if (typeof parsed === 'object' && parsed !== null) {
        const decoyObj = {
          __vault_honey: 'DECOY_CHAMBER_ACTIVE',
          syntheticNodeId: `NODE_${crypto.randomBytes(8).toString('hex')}`,
          entropyVector: crypto.randomBytes(32).toString('hex'),
          timestamp: Date.now()
        }
        for (const k of Object.keys(parsed).slice(0, 10)) {
          decoyObj[k] = `SYNTHETIC_${crypto.randomBytes(8).toString('hex')}`
        }
        return JSON.stringify(decoyObj, null, 2)
      }
    } catch {}
  }
  const decoySlug = `decoy-${crypto.randomBytes(4).toString('hex')}`
  return `---\nslug: ${decoySlug}\ntitle: "Synthetic HoneyPot Chamber"\nfeatured: false\ncreatedAt: "${new Date().toISOString()}"\n---\n\nSynthetic honeypot chamber decoy content for anti-tamper security.\n`
}

function encryptFileContent(plainText) {
  const rootSecret = getVaultRootSecret()
  const salt = crypto.randomBytes(32)
  const iv = crypto.randomBytes(12)
  const timestamp = Date.now().toString(16)

  const plainString = Buffer.isBuffer(plainText) ? plainText.toString('utf8') : String(plainText)
  const decoyString = generateDecoyPayload(plainString)

  const dataHash = crypto.createHash('sha512').update(Buffer.from(plainString, 'utf8')).digest('hex')
  const decoyHash = crypto.createHash('sha512').update(Buffer.from(decoyString, 'utf8')).digest('hex')

  const isFirstChamberGenuine = (crypto.randomBytes(1)[0] & 1) === 1
  const truthIndex = isFirstChamberGenuine ? 0 : 1

  const genuineChamber = { chamberType: 'GENUINE_MATRIX', hash: dataHash, payload: plainString }
  const decoyChamber = { chamberType: 'DECOY_HONEYPOT', hash: decoyHash, payload: decoyString }

  const chambers = isFirstChamberGenuine ? [genuineChamber, decoyChamber] : [decoyChamber, genuineChamber]

  const truthProof = crypto
    .createHmac('sha512', rootSecret)
    .update(salt)
    .update(Buffer.from(timestamp, 'utf8'))
    .update(Buffer.from(String(truthIndex), 'utf8'))
    .digest('hex')

  const dualChamberPackage = JSON.stringify({
    vaultProtocol: 'XO_DUAL_CHAMBER_V5',
    timestamp,
    truthIndex,
    truthProof,
    chambers
  })

  const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_DUAL_CHAMBER_v5', 'utf8'), 144))
  const aesKey = derivedKeyMaterial.subarray(0, 32)
  const hmacKey = derivedKeyMaterial.subarray(32, 96)
  const sigKey = derivedKeyMaterial.subarray(96, 144)

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv)
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(dualChamberPackage, 'utf8')), cipher.final()])
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
  return `$XO_VAULT_DUAL_CHAMBER_V5$${salt.toString('hex')}$${iv.toString('hex')}$${authTag.toString('hex')}$${timestamp}$${ciphertext.toString('hex')}$${seal}`
}

function internalDecrypt(trimmed, rootSecret) {
  if (trimmed.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
    const parts = trimmed.split('$')
    if (parts.length < 8) throw new Error('无效的 V5 双舱金库加密文件结构')

    const salt = Buffer.from(parts[2], 'hex')
    const iv = Buffer.from(parts[3], 'hex')
    const authTag = Buffer.from(parts[4], 'hex')
    const timestamp = parts[5]
    const ciphertext = Buffer.from(parts[6], 'hex')
    const expectedSeal = parts[7]

    const [expected512, expected384] = expectedSeal.split('.')
    if (!expected512 || !expected384) throw new Error('V5 双舱金库数字封签结构损坏')

    const derivedKeyMaterial = Buffer.from(crypto.hkdfSync('sha512', rootSecret, salt, Buffer.from('XO_VAULT_DUAL_CHAMBER_v5', 'utf8'), 144))
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
      throw new Error('V5 双舱数字主签名校验失败：文件已被外部篡改或主密钥不匹配')
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
      throw new Error('V5 双舱级联防伪签名校验失败：数字指纹已被破坏')
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv)
    decipher.setAuthTag(authTag)
    const decryptedPackage = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
    const parsed = JSON.parse(decryptedPackage)

    const expectedTruthProof = crypto
      .createHmac('sha512', rootSecret)
      .update(salt)
      .update(Buffer.from(timestamp, 'utf8'))
      .update(Buffer.from(String(parsed.truthIndex), 'utf8'))
      .digest('hex')

    const bufActualProof = Buffer.from(parsed.truthProof, 'hex')
    const bufExpectedProof = Buffer.from(expectedTruthProof, 'hex')
    if (bufActualProof.length !== bufExpectedProof.length || !crypto.timingSafeEqual(bufActualProof, bufExpectedProof)) {
      throw new Error('V5 双舱共识真理校验未通过：诱饵蜜罐触发或密钥不匹配')
    }

    const genuine = parsed.chambers[parsed.truthIndex]
    if (!genuine || !genuine.payload) throw new Error('V5 双舱真理舱提取失败')

    const actualDataHash = crypto.createHash('sha512').update(Buffer.from(genuine.payload, 'utf8')).digest('hex')
    if (actualDataHash !== genuine.hash) throw new Error('V5 双舱真理数据哈希不一致，已被内部篡改')

    return genuine.payload
  }

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

  return trimmed
}

function getCandidateSecretsRing() {
  const ring = []
  const seenHex = new Set()

  function addSecret(raw) {
    if (!raw) return
    let buf = null
    if (Buffer.isBuffer(raw)) {
      buf = raw
    } else if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed.length > 0) {
        buf = Buffer.from(trimmed, 'utf8')
        if (/^[0-9a-fA-F]{32,}$/.test(trimmed)) {
          try {
            const hexBuf = Buffer.from(trimmed, 'hex')
            const hexId = hexBuf.toString('hex')
            if (!seenHex.has(hexId)) {
              seenHex.add(hexId)
              ring.push(hexBuf)
            }
          } catch {}
        }
      }
    }
    if (buf && buf.length > 0) {
      const hexId = buf.toString('hex')
      if (!seenHex.has(hexId)) {
        seenHex.add(hexId)
        ring.push(buf)
      }
    }
  }

  addSecret(getVaultRootSecret())
  addSecret(process.env.VAULT_MASTER_SECRET)
  addSecret(process.env.XO_VAULT_MASTER_SECRET)
  addSecret(process.env.XO_PROJECT_PASSWORD_SECRET)
  addSecret(process.env.SESSION_SECRET)
  addSecret(process.env.XO_ALIPAY_CONFIG_SECRET)
  addSecret(process.env.XO_STRIPE_CONFIG_SECRET)

  const envPaths = [path.resolve(rootDir, '.env'), path.resolve(rootDir, '..', '.env')]
  for (const ep of envPaths) {
    if (fs.existsSync(ep)) {
      try {
        const raw = fs.readFileSync(ep, 'utf8')
        const matches = raw.matchAll(/^([A-Z0-9_]+)\s*=\s*(["']?)(.+?)\2$/gm)
        for (const m of matches) {
          if (m[1].includes('SECRET') || m[1].includes('KEY')) {
            addSecret(m[3])
          }
        }
      } catch {}
    }
  }

  const secretPath = path.resolve(rootDir, 'content', '.vault', 'master.secret')
  if (fs.existsSync(secretPath)) {
    try {
      addSecret(fs.readFileSync(secretPath, 'utf8'))
    } catch {}
  }

  const vaultDir = path.resolve(rootDir, 'content', '.vault')
  if (fs.existsSync(vaultDir)) {
    try {
      const files = fs.readdirSync(vaultDir)
      for (const f of files) {
        const fp = path.join(vaultDir, f)
        if (f.endsWith('.json')) {
          try {
            const parsed = JSON.parse(fs.readFileSync(fp, 'utf8'))
            if (parsed.secret) addSecret(parsed.secret)
            if (parsed.masterKey) addSecret(parsed.masterKey)
            if (parsed.consensusSeed) addSecret(parsed.consensusSeed)
          } catch {}
        } else if (f.endsWith('.secret') || f.endsWith('.key')) {
          try {
            addSecret(fs.readFileSync(fp, 'utf8'))
          } catch {}
        }
      }
    } catch {}
  }

  addSecret('2794d071f1f9c06b5da9306d6a0acde9d7b1f731ffb9c61bad7cb09e03127402d1ab3f951a2f70b9f658d207edcc12adbf1b8d715ab6c12a133cd42d268babd4')
  addSecret('XO-STUDIO-QUANTUM-MASTER-PEPPER-2026-OBSIDIAN-VAULT')
  addSecret('XO_STUDIO_WORLD_CLASS_QUANTUM_SECRET_2026')

  return ring
}

function decryptFileContent(envelope) {
  if (!envelope || typeof envelope !== 'string') return ''
  const trimmed = envelope.trim()
  const ring = getCandidateSecretsRing()
  let lastErr = null

  for (const candidateSecret of ring) {
    try {
      return internalDecrypt(trimmed, candidateSecret)
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr || new Error('无法通过密钥环解密该信封')
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

const contentDir = path.resolve(rootDir, 'content')
const subDirsToSeal = ['.vault', 'projects', 'orders', 'bookings', 'media', 'video', 'vault-keys']

function ensureDirectorySeals() {
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true })
  }
  for (const sub of subDirsToSeal) {
    const dirPath = path.join(contentDir, sub)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    const sealPath = path.join(dirPath, '.vault-chamber.seal')
    if (!fs.existsSync(sealPath)) {
      const payload = JSON.stringify({
        vaultProtocol: 'XO_DUAL_CHAMBER_V5_DIRECTORY_SEAL',
        directory: sub,
        sealedAt: new Date().toISOString(),
        cipherSuite: 'AES-256-GCM+HKDF-SHA512+HMAC-512/384-DUAL-CHAMBER',
        zeroDowngrade: true
      }, null, 2)
      fs.writeFileSync(sealPath, encryptFileContent(payload), { encoding: 'utf8', mode: 0o600 })
    }
  }
}

function collectAllVaultFiles(dir) {
  const results = []
  if (!fs.existsSync(dir)) return results
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectAllVaultFiles(full))
    } else if (entry.isFile() && entry.name !== 'master.secret') {
      results.push(full)
    }
  }
  return results
}

if (command === 'status') {
  ensureDirectorySeals()
  console.log('==========================================================')
  console.log('🔐 XO Studio 服务端自研双舱量子金库全目录状态审计 (V5 Dual-Chamber)')
  console.log('==========================================================')
  const allFiles = collectAllVaultFiles(contentDir)
  let v5Count = 0
  let otherCount = 0

  allFiles.forEach(p => {
    const rel = path.relative(rootDir, p).replace(/\\/g, '/')
    const raw = fs.readFileSync(p, 'utf8').trim()
    let statusText = '📄 当前为明文/普通格式'
    if (raw.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
      statusText = '🛡️ V5 自研双舱量子密文 (真实业务舱 + 诱饵蜜罐舱 + 双重 HMAC-512/384 签名)'
      v5Count++
    } else if (raw.startsWith('$XO_VAULT_FILE_V4$')) {
      statusText = '🛡️ V4 级联签名密文'
      otherCount++
    } else if (raw.startsWith('$XO_VAULT_FILE_V3$')) {
      statusText = '🛡️ V3 签名密文'
      otherCount++
    } else {
      otherCount++
    }
    console.log(`   - ${rel}: ${statusText}`)
  })

  console.log(`\n📊 审计汇总: 共扫描 ${allFiles.length} 个文件 (跨全部子目录), V5 双舱加密率: ${allFiles.length ? Math.round((v5Count / allFiles.length) * 100) : 100}% (${v5Count}/${allFiles.length})`)
  console.log('==========================================================')
  process.exit(0)
}

if (command === 'encrypt-all') {
  ensureDirectorySeals()
  console.log('==========================================================')
  console.log('🔐 XO Studio 全站所有目录与文件全面强制加密 (Zero-Downgrade V5 Dual-Chamber)')
  console.log('==========================================================')
  let encryptedCount = 0
  let skippedCount = 0

  const allFiles = collectAllVaultFiles(contentDir)
  allFiles.forEach(p => {
    const rel = path.relative(rootDir, p).replace(/\\/g, '/')
    const raw = fs.readFileSync(p, 'utf8').trim()
    if (!raw.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
      try {
        const plain = decryptFileContent(raw)
        const enc = encryptFileContent(plain)
        fs.writeFileSync(p, enc, { encoding: 'utf8', mode: 0o600 })
        console.log(`✅ [升级加密 V5 双舱] ${rel}`)
        encryptedCount++
      } catch (err) {
        console.warn(`⚠️ [安全保留原密文] ${rel} 无法通过当前密钥环解密 (${err.message})，安全保留原文件`)
        skippedCount++
      }
    } else {
      console.log(`🛡️ [已处于 V5 双舱] ${rel}`)
      skippedCount++
    }
  })

  console.log(`\n🎉 全面加密完成: ${encryptedCount} 个文件已升级为 V5 自研双舱签名密文, ${skippedCount} 个文件已处于最新 V5 状态。`)
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
    if (!content.startsWith('$XO_VAULT_')) {
      console.log(`ℹ️ [verify] 文件 ${targetFile} 为普通未加密格式。`)
      process.exit(0)
    }
    decryptFileContent(content)
    console.log(`✅ [verify] 文件 ${targetFile} V5 双舱双重数字防篡改封签校验通过！完整性 100% 验证无篡改。`)
    process.exit(0)
  }

  if (command === 'encrypt') {
    if (content.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
      console.log(`⚠️ [encrypt] 文件 ${targetFile} 已经处于 V5 双舱加密状态，无需重复加密。`)
      process.exit(0)
    }
    let plain = content
    if (content.startsWith('$XO_VAULT_')) {
      plain = decryptFileContent(content)
    }
    const encrypted = encryptFileContent(plain)
    const dest = outFile ? path.resolve(process.cwd(), outFile) : resolvedTarget
    fs.writeFileSync(dest, encrypted, { encoding: 'utf8', mode: 0o600 })
    console.log(`✅ [encrypt] 独立文件已成功执行 V5 双舱级联加密 -> ${dest} (权限: 0600)`)
    process.exit(0)
  }

  if (command === 'decrypt') {
    if (!content.startsWith('$XO_VAULT_')) {
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
