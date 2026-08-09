#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const outputRoot = path.resolve('.output')
const publicRoot = path.resolve('.output/public')
const sourceMapPattern = /(?:sourceMappingURL|sourcesContent|webpack:\/\/|vite:\/\/)/i

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(fullPath))
    else if (entry.isFile()) files.push(fullPath)
  }
  return files
}

const files = await walk(outputRoot).catch(() => [])
const mapFiles = files.filter(file => file.endsWith('.map'))
const sourceLeaks = []

const publicFiles = await walk(publicRoot).catch(() => [])
for (const file of publicFiles.filter(file => /\.(js|mjs|css)$/.test(file))) {
  const content = await fs.readFile(file, 'utf8')
  if (sourceMapPattern.test(content)) sourceLeaks.push(file)
}

if (mapFiles.length || sourceLeaks.length) {
  console.error(`[verify] Production artifact check failed: ${mapFiles.length} map files, ${sourceLeaks.length} source references`)
  for (const file of [...mapFiles, ...sourceLeaks].slice(0, 20)) console.error(` - ${file}`)
  process.exit(1)
}

console.log(`[verify] Production artifact check passed: ${files.length} files, no sourcemaps or source references`)
