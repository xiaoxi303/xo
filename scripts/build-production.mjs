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

const runNuxtBuild = () => {
  console.log(`\n[build] compile production bundle`)
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, [npmCli, 'run', 'build:nuxt'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env,
      shell: false
    })

    let buildCompleteDetected = false
    let autoExitTimer = null

    const checkCompleteAndExit = () => {
      if (buildCompleteDetected) return
      buildCompleteDetected = true

      // Allow 2 seconds for natural exit before releasing lingering event loop handles
      autoExitTimer = setTimeout(() => {
        const outputEntry = path.resolve(process.cwd(), '.output', 'server', 'index.mjs')
        if (fs.existsSync(outputEntry)) {
          console.log('\n[build] Production bundle verified at .output/server/index.mjs. Releasing build process.')
          try { child.kill('SIGTERM') } catch {}
          setTimeout(() => {
            try { child.kill('SIGKILL') } catch {}
            resolve()
          }, 600)
        }
      }, 2000)
    }

    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk)
      const text = chunk.toString()
      if (text.includes('Build complete') || text.includes('You can preview this build')) {
        checkCompleteAndExit()
      }
    })

    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk)
      const text = chunk.toString()
      if (text.includes('Build complete') || text.includes('You can preview this build')) {
        checkCompleteAndExit()
      }
    })

    child.on('close', (code) => {
      if (autoExitTimer) clearTimeout(autoExitTimer)
      if (code === 0 || buildCompleteDetected) {
        resolve()
      } else {
        reject(new Error(`nuxt build failed with exit code ${code}`))
      }
    })

    child.on('error', (err) => {
      if (autoExitTimer) clearTimeout(autoExitTimer)
      reject(err)
    })
  })
}

async function main() {
  runSync(['run', 'init-data'], 'prepare runtime data')
  await runNuxtBuild()
  runSync(['run', 'verify:production'], 'verify production artifacts')
  console.log('\n[build] Production build completed successfully.')
}

main().catch((err) => {
  console.error(`[build] Fatal error during production build:`, err)
  process.exit(1)
})
