#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

let JavaScriptObfuscator
try {
  const mod = await import('javascript-obfuscator')
  JavaScriptObfuscator = mod.default || mod
} catch (e) {
  console.warn('[obfuscate] ⚠️ javascript-obfuscator 未安装或加载失败，跳过独立混淆阶段并正常继续。')
  process.exit(0)
}

const serverRoot = path.resolve('.output/server/chunks')

async function walk(directory, exts = ['.mjs']) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') {
          files.push(...await walk(fullPath, exts))
        }
      } else if (entry.isFile() && exts.some(ext => fullPath.endsWith(ext))) {
        files.push(fullPath)
      }
    }
    return files
  } catch {
    return []
  }
}

const serverFiles = await walk(serverRoot, ['.mjs'])
try {
  const serverIndex = path.resolve('.output/server/index.mjs')
  const stat = await fs.stat(serverIndex)
  if (stat.isFile()) serverFiles.push(serverIndex)
} catch {}

if (!serverFiles.length) {
  console.log('[obfuscate] Notice: No server JavaScript chunks found to obfuscate.')
  process.exit(0)
}

const serverOptions = {
  target: 'node',
  compact: true,
  simplify: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  renameProperties: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  stringArrayIndexShift: true,
  rotateStringArray: true,
  shuffleStringArray: true,
  stringArrayCallsTransform: false,
  unicodeEscapeSequence: false,
  numbersToExpressions: false,
  splitStrings: false,
  transformObjectKeys: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  selfDefending: false,
  sourceMap: false,
  log: false
}

let obfuscatedCount = 0
for (const file of serverFiles) {
  try {
    const source = await fs.readFile(file, 'utf8')
    const result = JavaScriptObfuscator.obfuscate(source, serverOptions).getObfuscatedCode()
    await fs.writeFile(file, `${result}\n`, 'utf8')
    obfuscatedCount++
  } catch (err) {
    // If a server chunk contains constructs that fail AST parsing, leave it safe
  }
}

console.log(`[obfuscate] ✅ Obfuscated ${obfuscatedCount} backend server chunks (client ESM bundles protected by esbuild high-perf minifier).`)
