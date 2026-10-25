import { defineEventHandler, getCookie, readBody, getQuery, getHeader, createError } from 'h3'
import { validateSession, SESSION_COOKIE, destroyAllUserSessions } from '../../utils/auth'
import { dbGetBlacklist, dbAddBlacklist, dbRemoveBlacklist, dbGetUsers, dbUpdateUser } from '../../utils/db'
import { resetRateLimit, getActiveRateLimits, clearAllRateLimits } from '../../utils/rate-limiter'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的管理会话。' })
  }

  const method = event.node.req.method

  if (method === 'GET') {
    const rawList = await dbGetBlacklist(event).catch(() => [])
    const activeLocks = getActiveRateLimits()

    const query = getQuery(event)
    if (query.raw === 'true' || getHeader(event, 'x-raw-array') === 'true') {
      return rawList
    }

    return {
      success: true,
      blacklist: rawList,
      activeLocks
    }
  }

  if (method === 'POST') {
    const body = (await readBody(event).catch(() => ({}))) || {}
    const action = String(body.action || '').trim().toLowerCase()
    const value = String(body.value || '').trim()
    const type = String(body.type || 'ip').trim()
    const reason = String(body.reason || '管理员后台操作').trim()

    // 1. 一键全站重置所有临时封锁与频率限制
    if (action === 'clear_all') {
      clearAllRateLimits()
      if (body.clearBlacklistFile) {
        const blacklist = await dbGetBlacklist(event).catch(() => [])
        for (const item of blacklist) {
          if (item?.value) {
            await dbRemoveBlacklist(event, item.value).catch(() => {})
          }
        }
      }
      return {
        success: true,
        message: '已成功清除所有实时安全锁定与封禁限制！'
      }
    }

    // 2. 一键解除限制 (移除黑名单 + 清除速率锁定 + 同步解除用户封禁)
    if (action === 'remove' || action === 'unban') {
      if (!value) {
        throw createError({ statusCode: 400, statusMessage: '缺少需解除限制的目标值。' })
      }

      // 从持久化 blacklist.json 中彻底移除
      await dbRemoveBlacklist(event, value).catch(() => {})

      // 清除内存中所有相关的封禁与防刷频率锁定
      resetRateLimit(value)
      resetRateLimit(`client-ip:${value}`)
      resetRateLimit(`client-user:${value}`)
      resetRateLimit(`admin:${value}`)
      resetRateLimit(`mach:${value}`)

      // 若匹配到注册用户，同步解除其封禁与违规警告计数
      try {
        const users = await dbGetUsers(event)
        const targetVal = value.toLowerCase()
        const matched = users.find((u: any) =>
          String(u.id) === targetVal ||
          String(u.username || '').toLowerCase() === targetVal ||
          String(u.email || '').toLowerCase() === targetVal
        )
        if (matched) {
          await dbUpdateUser(event, matched.id, {
            isBlacklisted: false,
            blacklistReason: '',
            warningCount: 0
          })
          resetRateLimit(`client-user:${matched.username}`)
          if (matched.email) resetRateLimit(`client-user:${matched.email}`)
        }
      } catch (err) {}

      return {
        success: true,
        message: `已成功解除【${value}】的全部封锁与限制！`
      }
    }

    // 3. 手动添加封禁 (IP / 用户名 / 邮箱 / 设备机器码)
    if (action === 'add' || action === 'ban') {
      if (!value) {
        throw createError({ statusCode: 400, statusMessage: '请输入要封禁的 IP 或用户名。' })
      }

      await dbAddBlacklist(event, {
        type,
        value,
        reason
      })

      // 若为用户，同步标记黑名单
      try {
        const users = await dbGetUsers(event)
        const targetVal = value.toLowerCase()
        const matched = users.find((u: any) =>
          String(u.id) === targetVal ||
          String(u.username || '').toLowerCase() === targetVal ||
          String(u.email || '').toLowerCase() === targetVal
        )
        if (matched) {
          await dbUpdateUser(event, matched.id, {
            isBlacklisted: true,
            blacklistReason: reason
          })
          if (matched.username) {
            destroyAllUserSessions(matched.username)
          }
        }
      } catch (err) {}

      return {
        success: true,
        message: `已成功将【${value}】加入封禁名单！`
      }
    }

    throw createError({ statusCode: 400, statusMessage: '未知的操作指令。' })
  }

  return { success: false, statusMessage: 'Method Not Allowed' }
})
