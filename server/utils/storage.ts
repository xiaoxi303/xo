import fs from 'node:fs'
import path from 'node:path'

export function getRuntimeDataDir(): string {
  const configured = process.env.XO_DATA_DIR || process.env.NUXT_XO_DATA_DIR
  const dataDir = configured
    ? path.resolve(configured)
    : path.resolve(process.cwd(), 'content')

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  return dataDir
}

export function getRuntimeDataPath(...segments: string[]): string {
  const filePath = path.join(getRuntimeDataDir(), ...segments)
  const dir = path.dirname(filePath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  return filePath
}
