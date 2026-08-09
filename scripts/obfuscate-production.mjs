#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import JavaScriptObfuscator from 'javascript-obfuscator'

const root = path.resolve('.output/public/_nuxt')

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(fullPath))
    else if (entry.isFile() && fullPath.endsWith('.js')) files.push(fullPath)
  }
  return files
}

const files = await walk(root).catch(() => [])
if (!files.length) {
  console.error(`[obfuscate] No client JavaScript bundles found in ${root}`)
  process.exit(1)
}

const options = {
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

for (const file of files) {
  const source = await fs.readFile(file, 'utf8')
  const result = JavaScriptObfuscator.obfuscate(source, options).getObfuscatedCode()
  await fs.writeFile(file, `${result}\n`, 'utf8')
}

console.log(`[obfuscate] Obfuscated ${files.length} client bundles`)
