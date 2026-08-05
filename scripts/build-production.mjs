#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const npmCommand = process.execPath
const npmCli = process.env.npm_execpath || path.join(
  path.dirname(process.execPath),
  'node_modules',
  'npm',
  'bin',
  'npm-cli.js'
)

const env = {
  ...process.env,
  NODE_ENV: 'production',
  NUXT_TELEMETRY_DISABLED: '1',
  NODE_OPTIONS: '--max-old-space-size=8192'
}

const run = (args, label) => {
  console.log(`\n[build] ${label}`)
  const result = spawnSync(npmCommand, [npmCli, ...args], {
    stdio: 'inherit',
    env,
    shell: false
  })

  if (result.error) {
    console.error(`[build] ${label} failed: ${result.error.message}`)
    process.exit(result.status || 1)
  }

  if (result.status !== 0) {
    console.error(`[build] ${label} failed with exit code ${result.status}`)
    process.exit(result.status || 1)
  }
}

run(['run', 'init-data'], 'prepare runtime data')
run(['run', 'build:nuxt'], 'compile production bundle')

console.log('\n[build] Production build completed successfully.')
