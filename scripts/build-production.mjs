#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
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

const buildTimeoutMs = Number(process.env.BUILD_TIMEOUT_MS || 300000)

const runSync = (args, label) => {
  console.log(`\n[build] ${label}`)
  const result = spawnSync(npmCommand, [npmCli, ...args], {
    stdio: 'inherit',
    env,
    shell: false,
    timeout: buildTimeoutMs,
    killSignal: 'SIGTERM'
  })

  if (result.error) {
    if (result.error.code === 'ETIMEDOUT') {
      console.error(`[build] ${label} timed out after ${Math.round(buildTimeoutMs / 1000)}s`)
    }
    console.error(`[build] ${label} failed: ${result.error.message}`)
    process.exit(result.status || 1)
  }

  if (result.status !== 0) {
    console.error(`[build] ${label} failed with exit code ${result.status}`)
    process.exit(result.status || 1)
  }
}

const killProcessTree = (pid) => {
  if (!pid) return
  if (process.platform === 'win32') {
    try {
      spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' })
    } catch {}
  } else {
    try {
      process.kill(-pid, 'SIGKILL')
    } catch {
      try { process.kill(pid, 'SIGKILL') } catch {}
    }
  }
}

const runNuxtBuild = () => {
  console.log(`\n[build] compile production bundle`)
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, [npmCli, 'run', 'build:nuxt'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env,
      shell: false,
      detached: process.platform !== 'win32'
    })

    const outputEntry = path.resolve(process.cwd(), '.output', 'server', 'index.mjs')
    let buildCompleteDetected = false
    let autoExitTimer = null
    let pollInterval = null
    let textBuffer = ''

    const checkCompleteAndExit = () => {
      if (buildCompleteDetected) return
      buildCompleteDetected = true

      // Poll until .output/server/index.mjs is actually flushed to disk
      pollInterval = setInterval(() => {
        try {
          if (fs.existsSync(outputEntry) && fs.statSync(outputEntry).size > 0) {
            clearInterval(pollInterval)
            pollInterval = null
            console.log('\n[build] Production bundle verified at .output/server/index.mjs.')

            // Allow 2 seconds for natural exit before forcefully terminating lingering handles
            autoExitTimer = setTimeout(() => {
              killProcessTree(child.pid)
              resolve()
            }, 2000)
          }
        } catch {}
      }, 500)
    }

    const onData = (chunk) => {
      process.stdout.write(chunk)
      textBuffer = (textBuffer + chunk.toString()).slice(-8192)
      if (
        textBuffer.includes('Nuxt Nitro server built') ||
        textBuffer.includes('Build complete') ||
        textBuffer.includes('You can preview this build')
      ) {
        checkCompleteAndExit()
      }
    }

    child.stdout.on('data', onData)
    child.stderr.on('data', onData)

    child.on('close', (code) => {
      if (pollInterval) clearInterval(pollInterval)
      if (autoExitTimer) clearTimeout(autoExitTimer)

      let hasEntry = false
      try {
        hasEntry = fs.existsSync(outputEntry) && fs.statSync(outputEntry).size > 0
      } catch {}

      if (hasEntry) {
        resolve()
      } else {
        reject(new Error(`nuxt build finished without generating .output/server/index.mjs (exit code: ${code})`))
      }
    })

    child.on('error', (err) => {
      if (pollInterval) clearInterval(pollInterval)
      if (autoExitTimer) clearTimeout(autoExitTimer)
      reject(err)
    })
  })
}

async function main() {
  runSync(['run', 'init-data'], 'prepare runtime data')

  // Clean old output & build cache before building to ensure absolute freshness
  try {
    fs.rmSync(path.resolve(process.cwd(), '.output'), { recursive: true, force: true })
    fs.rmSync(path.resolve(process.cwd(), '.nuxt'), { recursive: true, force: true })
  } catch {}

  await runNuxtBuild()
  runSync(['run', 'obfuscate:production'], 'obfuscate client production bundles')
  runSync(['run', 'verify:production'], 'verify production artifacts')

  // Scrub internal schema dumps and nuxt-content metadata from public distribution
  try {
    const publicContentDir = path.resolve(process.cwd(), '.output', 'public', '__nuxt_content')
    fs.rmSync(publicContentDir, { recursive: true, force: true })
    console.log('[build] Cleaned sensitive internal schema dumps (__nuxt_content) from public directory.')
  } catch {}

  console.log('\n[build] Production build completed successfully.')
}

main().catch((err) => {
  console.error(`[build] Fatal error during production build:`, err)
  process.exit(1)
})
