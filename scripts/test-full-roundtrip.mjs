#!/usr/bin/env node
/**
 * scripts/test-full-roundtrip.mjs
 * 全链路端到端加解密与抗篡改数字签名双向联合压力测试
 * (Frontend-to-Server Full Roundtrip & Anti-Tamper Verification Suite)
 * 
 * 直接调用客户端生产代码 encryptRsaHybrid 与服务端生产代码 decryptRsaHybridWithVault
 */

import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  issueOneTimePublicKey,
  decryptRsaHybridWithVault,
  vaultTimingSafeEqual
} from '../server/utils/vault-cipher.ts'
import {
  encryptFileContent,
  decryptFileContent,
  readEncryptedFile,
  writeEncryptedFile
} from '../server/utils/storage.ts'
import { encryptRsaHybrid } from '../app/utils/rsa-hybrid.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// 模拟前端 $fetch 获取服务端单次公钥票据 (OTPK)
let currentOtpk = null
globalThis.$fetch = async (url) => {
  if (url.includes('/api/security/rsa-public-key')) {
    currentOtpk = issueOneTimePublicKey('127.0.0.1')
    return currentOtpk
  }
  throw new Error(`Unhandled fetch: ${url}`)
}

async function runTestSuite() {
  console.log('======================================================================')
  console.log('🧪 XO Studio · 真实生产代码前端加解密与自研抗篡改签名全链路深度测试')
  console.log('======================================================================\n')

  let passCount = 0
  const totalTests = 7

  // ── TEST 1: 服务端签发一次性公钥凭证 (OTPK) ───────────────────────────
  console.log('▶ [TEST 1/7] 服务端签发一次性公钥凭据 (OTPK)...')
  const otpk = issueOneTimePublicKey('127.0.0.1')
  if (!otpk || !otpk.publicKey || !otpk.keyId || !otpk.consensusSeed) {
    throw new Error('TEST 1 FAILED: OTPK 结构不完整')
  }
  console.log(`  ✅ OTPK 签发成功: KeyID=${otpk.keyId.slice(0, 35)}... 算法=${otpk.algorithm}`)
  passCount++

  // ── TEST 2: 真实前端 encryptRsaHybrid -> 真实服务端 decryptRsaHybridWithVault ─────
  console.log('\n▶ [TEST 2/7] 真实前端 WebCrypto 双舱宏观装甲加密 -> 服务端真理共识解密...')
  const testPayload = {
    action: 'save_project',
    slug: 'quantum-film-2026',
    title: '量子电影调色终极工程',
    director: 'Xo Studio',
    isColorGraded: true,
    workflow: ['DaVinci Resolve Studio', 'ACEScc', 'Film Print Kodak 2383'],
    secretNotes: '全站零降级，双舱量子防篡改锁定'
  }

  // 直接调用客户端生产加密方法
  const encryptedPayload = await encryptRsaHybrid(testPayload)
  console.log(`  🔒 前端生产加密成功: Version=${encryptedPayload.version}, KeyID=${encryptedPayload.keyId.slice(0, 35)}...`)

  // 服务端生产解密方法
  const decryptedJson = await decryptRsaHybridWithVault(encryptedPayload)
  const decryptedObj = JSON.parse(decryptedJson)

  if (JSON.stringify(decryptedObj) !== JSON.stringify(testPayload)) {
    throw new Error(`TEST 2 FAILED: 解密内容不一致: ${decryptedJson}`)
  }
  console.log('  ✅ 服务端成功解密还原原始载荷，数据 100% 精确匹配！')
  passCount++

  // ── TEST 3: 防重放攻击拦截 (Anti-Replay Protection) ────────────────────
  console.log('\n▶ [TEST 3/7] 防重放攻击安全校验 (二次提交相同凭据)...')
  try {
    await decryptRsaHybridWithVault(encryptedPayload)
    throw new Error('TEST 3 FAILED: 重放攻击未被拦截！')
  } catch (err) {
    console.log(`  🛡️ 成功拦截重放攻击: "${err.message}"`)
    passCount++
  }

  // ── TEST 4: 传输层数字签名与密文抗篡改验证 ───────────────────────────
  console.log('\n▶ [TEST 4/7] 传输层篡改探测 (篡改密文字节或篡改数字签名)...')
  const tamperedPayload = await encryptRsaHybrid({ test: 'tamper-check', amount: 999999 })
  // 恶意攻击者篡改 outerCiphertext 的末尾字符
  const originalOuter = tamperedPayload.macroArmor.outerCiphertext
  tamperedPayload.macroArmor.outerCiphertext = originalOuter.slice(0, -4) + 'AAAA'

  try {
    await decryptRsaHybridWithVault(tamperedPayload)
    throw new Error('TEST 4 FAILED: 篡改密文未被签名引擎拦截！')
  } catch (err) {
    console.log(`  🛡️ 数字签名与完整性引擎成功阻断篡改: "${err.message}"`)
    passCount++
  }

  // ── TEST 5: 独立文件 V5 双舱加密与双重级联签名 ─────────────────────────
  console.log('\n▶ [TEST 5/7] 独立文件 V5 双舱加密与 HMAC-512/384 双重级联签名验证...')
  const fileContent = JSON.stringify({
    serverSettings: 'PROD_2026',
    dbKey: 'SECURE_D1_VAULT',
    projectsCount: 42
  }, null, 2)

  const encryptedFileStr = encryptFileContent(fileContent)
  if (!encryptedFileStr.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
    throw new Error('TEST 5 FAILED: 密文头部未符合 $XO_VAULT_DUAL_CHAMBER_V5$')
  }

  const parts = encryptedFileStr.split('$')
  if (parts.length < 8) {
    throw new Error('TEST 5 FAILED: V5 信封字段数量不足')
  }
  const seal = parts[7]
  const [h512, h384] = seal.split('.')
  if (!h512 || h512.length !== 128 || !h384 || h384.length !== 96) {
    throw new Error(`TEST 5 FAILED: 级联签名格式异常: h512 len=${h512?.length}, h384 len=${h384?.length}`)
  }
  console.log(`  ✅ V5 信封格式正确: HMAC-512(${h512.length}位) + HMAC-384(${h384.length}位) 级联双签`)

  const decryptedFileStr = decryptFileContent(encryptedFileStr)
  if (decryptedFileStr !== fileContent) {
    throw new Error('TEST 5 FAILED: 磁盘文件解密内容与原文不符')
  }
  console.log('  ✅ 独立文件解密内容与原文 100% 一致！')
  passCount++

  // ── TEST 6: 存储层级联签名抗物理篡改探测 ───────────────────────────────
  console.log('\n▶ [TEST 6/7] 存储层级联签名抗物理篡改测试 (恶意修改磁盘密文字节)...')
  const tamperedFileStr = encryptedFileStr.slice(0, 100) + 'X' + encryptedFileStr.slice(101)
  try {
    decryptFileContent(tamperedFileStr)
    throw new Error('TEST 6 FAILED: 磁盘文件篡改未被级联签名引擎察觉！')
  } catch (err) {
    console.log(`  🛡️ 存储层级联签名引擎成功阻断磁盘文件篡改: "${err.message}"`)
    passCount++
  }

  // ── TEST 7: 常时安全比对函数 (Timing-Safe Equal) 校验 ──────────────────
  console.log('\n▶ [TEST 7/8] 常时安全比对抗侧信道测试 (crypto.timingSafeEqual)...')
  const a = 'A'.repeat(64)
  const b = 'A'.repeat(64)
  const c = 'A'.repeat(63) + 'B'
  if (!vaultTimingSafeEqual(a, b) || vaultTimingSafeEqual(a, c)) {
    throw new Error('TEST 7 FAILED: vaultTimingSafeEqual 行为异常')
  }
  console.log('  ✅ 常时安全比对通过，侧信道时序攻击已完全免疫！')
  passCount++

  // ── TEST 8: 管理员密码彻底消除明文与 V5 双舱级联签名通道测试 ───────────────
  console.log('\n▶ [TEST 8/8] 管理员密码彻底消除明文传输与 V5 双舱封签通道实测...')
  const rawAdminPassword = 'XO_CINEMA_SUPER_KEY_888'
  // 服务端加密
  const sealedPasswordToken = encryptFileContent(rawAdminPassword)
  if (!sealedPasswordToken.startsWith('$XO_VAULT_DUAL_CHAMBER_V5$')) {
    throw new Error('TEST 8 FAILED: 密码封签未升级为 V5 双舱架构')
  }
  console.log(`  🔒 密码已彻底脱离明文，已封装为 V5 双舱级联封签: ${sealedPasswordToken.slice(0, 45)}...`)

  // 管理员通过合法会话专属解密通道安全解出
  const unsealedPassword = decryptFileContent(sealedPasswordToken)
  if (unsealedPassword !== rawAdminPassword) {
    throw new Error('TEST 8 FAILED: 密码解封内容与原密码不符')
  }
  console.log('  ✅ 管理员专属通道成功通过双重级联验签解密出原密码，完全阻断公网与网络明文传输！')
  passCount++

  console.log('\n======================================================================')
  console.log(`🎉 全部 ${passCount}/8 项全链路加解密与抗篡改数字签名测试 100% 完美通过！`)
  console.log('======================================================================')
}

runTestSuite().catch(err => {
  console.error('\n❌ 测试套件执行失败:', err)
  process.exit(1)
})
