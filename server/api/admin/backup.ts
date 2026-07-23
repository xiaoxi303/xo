import { defineEventHandler, getCookie, createError, readBody } from 'h3'
import fs from 'node:fs'
import path from 'node:path'
import { validateSession, SESSION_COOKIE } from '../../utils/auth'
import { 
  dbGetSiteConfig, 
  dbSaveSiteConfig, 
  dbGetProjectsRaw, 
  dbGetPasswordRequests,
  dbGetUsers
} from '../../utils/db'
import { getRuntimeDataPath } from '../../utils/storage'

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
      let blacklist: any[] = []
      const blPath = getRuntimeDataPath('blacklist.json')
      if (fs.existsSync(blPath)) {
        try {
          blacklist = JSON.parse(fs.readFileSync(blPath, 'utf-8'))
        } catch (e) {}
      }

      return {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        siteConfig,
        projects: projects || [],
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
        const { dbSaveProjectsRaw } = await import('../../utils/db')
        if (typeof dbSaveProjectsRaw === 'function') {
          await dbSaveProjectsRaw(event, body.projects)
        } else {
          const projsPath = getRuntimeDataPath('projects.json')
          fs.writeFileSync(projsPath, JSON.stringify(body.projects, null, 2), 'utf-8')
        }
        restoredSections.push(`${body.projects.length} 个视频作品`)
      }

      // 3. Restore Users Data
      if (Array.isArray(body.users)) {
        const usersPath = getRuntimeDataPath('users.json')
        fs.writeFileSync(usersPath, JSON.stringify(body.users, null, 2), 'utf-8')
        restoredSections.push(`${body.users.length} 个客户账号`)
      }

      // 4. Restore Password Requests Data
      if (Array.isArray(body.passwordRequests)) {
        const reqsPath = getRuntimeDataPath('password-requests.json')
        fs.writeFileSync(reqsPath, JSON.stringify(body.passwordRequests, null, 2), 'utf-8')
        restoredSections.push(`${body.passwordRequests.length} 条申请记录`)
      }

      // 5. Restore Blacklist Data
      if (Array.isArray(body.blacklist)) {
        const blPath = getRuntimeDataPath('blacklist.json')
        fs.writeFileSync(blPath, JSON.stringify(body.blacklist, null, 2), 'utf-8')
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
