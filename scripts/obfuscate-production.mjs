#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import JavaScriptObfuscator from 'javascript-obfuscator'

const clientRoot = path.resolve('.output/public/_nuxt')
const serverRoot = path.resolve('.output/server/chunks')

async function walk(directory, exts = ['.js', '.mjs']) {
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

const clientFiles = await walk(clientRoot, ['.js'])
const serverFiles = await walk(serverRoot, ['.mjs'])

if (!clientFiles.length && !serverFiles.length) {
  console.error(`[obfuscate] No client or server JavaScript bundles found to obfuscate.`)
  process.exit(1)
}

const clientOptions = {
  compact: true,
  simplify: true,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  renameProperties: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  rotateStringArray: true,
  transformObjectKeys: true,
  splitStrings: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: true,
  selfDefending: false,
  sourceMap: false,
  log: false
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
  rotateStringArray: true,
  transformObjectKeys: true,
  splitStrings: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  selfDefending: false,
  sourceMap: false,
  log: false
}

for (const file of clientFiles) {
  const source = await fs.readFile(file, 'utf8')
  const result = JavaScriptObfuscator.obfuscate(source, clientOptions).getObfuscatedCode()
  await fs.writeFile(file, `${result}\n`, 'utf8')
}

for (const file of serverFiles) {
  try {
    const source = await fs.readFile(file, 'utf8')
    const result = JavaScriptObfuscator.obfuscate(source, serverOptions).getObfuscatedCode()
    await fs.writeFile(file, `${result}\n`, 'utf8')
  } catch (err) {
    // If a chunk contains native constructs that fail AST parsing, leave it intact
  }
}

console.log(`[obfuscate] Obfuscated ${clientFiles.length} client bundles and ${serverFiles.length} server chunks.`)
