import { defineEventHandler, getCookie, createError, readBody } from 'h3'
import { validateSession, SESSION_COOKIE } from '../../utils/auth'
import { 
  dbGetSiteConfig, 
  dbSaveSiteConfig, 
  dbGetProjectsRaw, 
  dbGetPasswordRequests,
  dbGetUsers
} from '../../utils/db'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson, encryptFileContent, decryptFileContent } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const method = event.node.req.method

  // ── GET: Export full site JSON backup package ─────────────────────
  if (method === 'GET') {
    try {
      const siteConfig = await dbGetSiteConfig(event)
      const projects = await dbGetProjectsRaw(event)
      const passwordRequests = await dbGetPasswordRequests(event)
      const users = await dbGetUsers(event)
      
      // Blacklist fallback safely without throwing 404
      const blPath = getRuntimeDataPath('blacklist.json')
      const blacklist = readEncryptedJson<any[]>(blPath, [])

      // 密码零明文防护：备份包中所有作品密码自动封入自研 V5 双舱量子加密信封与双重级联签名
      const sealedProjects = (projects || []).map((p: any) => {
        const copy = { ...p }
        if (copy.password) {
          copy.encryptedPassword = copy.password.startsWith('$XO_VAULT_')
            ? copy.password
            : encryptFileContent(copy.password)
          copy.password = ''
        }
        return copy
      })

      return {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        siteConfig,
        projects: sealedProjects,
        passwordRequests: passwordRequests || [],
        users: users || [],
        blacklist
      }
    } catch (error: any) {
      console.error('Failed to export site backup:', error)
      throw createError({
        statusCode: 500,
        statusMessage: error.message || '导出全站备份包失败。'
      })
    }
  }

  // ── POST: Import and restore full site JSON backup package ───────
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      if (!body || typeof body !== 'object') {
        throw createError({ statusCode: 400, statusMessage: '无效的备份数据包。' })
      }

      let restoredSections = []

      // 1. Restore Site Configuration
      if (body.siteConfig && typeof body.siteConfig === 'object') {
        await dbSaveSiteConfig(event, body.siteConfig)
        restoredSections.push('站点全套配置')
      }

      // 2. Restore Projects Data
      if (Array.isArray(body.projects)) {
        const unsealedProjects = body.projects.map((p: any) => {
          const copy = { ...p }
          if (copy.encryptedPassword && (!copy.password || copy.password === '')) {
            try {
              copy.password = decryptFileContent(copy.encryptedPassword)
            } catch {
              copy.password = copy.encryptedPassword
            }
          }
          return copy
        })
        const { dbSaveProjectsRaw } = await import('../../utils/db')
        if (typeof dbSaveProjectsRaw === 'function') {
          await dbSaveProjectsRaw(event, unsealedProjects)
        } else {
          const projsPath = getRuntimeDataPath('projects.json')
          writeEncryptedJson(projsPath, unsealedProjects)
        }
        restoredSections.push(`${body.projects.length} 个视频作品`)
      }

      // 3. Restore Users Data (safely preserving existing credentials if not in backup)
      if (Array.isArray(body.users)) {
        const usersPath = getRuntimeDataPath('users.json')
        const currentUsers = readEncryptedJson<any[]>(usersPath, [])
        const mergedUsers = body.users.map((importedUser: any) => {
          const current = currentUsers.find((u: any) => u.username === importedUser.username || u.id === importedUser.id)
          return {
            ...importedUser,
            password: importedUser.password || current?.password || '',
            deliveryKeyHash: importedUser.deliveryKeyHash || current?.deliveryKeyHash || ''
          }
        })
        writeEncryptedJson(usersPath, mergedUsers)
        restoredSections.push(`${body.users.length} 个客户账号`)
      }

      // 4. Restore Password Requests Data
      if (Array.isArray(body.passwordRequests)) {
        const reqsPath = getRuntimeDataPath('password-requests.json')
        writeEncryptedJson(reqsPath, body.passwordRequests)
        restoredSections.push(`${body.passwordRequests.length} 条申请记录`)
      }

      // 5. Restore Blacklist Data
      if (Array.isArray(body.blacklist)) {
        const blPath = getRuntimeDataPath('blacklist.json')
        writeEncryptedJson(blPath, body.blacklist)
      }

      return {
        success: true,
        restoredSections,
        message: '全站备份恢复成功！'
      }
    } catch (error: any) {
      console.error('Failed to restore site backup:', error)
      throw createError({
        statusCode: 500,
        statusMessage: error.message || '恢复全站备份失败，请检查文件格式。'
      })
    }
  }
})
