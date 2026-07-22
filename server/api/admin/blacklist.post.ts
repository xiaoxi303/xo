import { dbAddBlacklist, dbRemoveBlacklist, dbGetBlacklist } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (event.node.req.method === 'GET') {
    return await dbGetBlacklist(event)
  }

  const { action, value, type, reason } = body || {}
  if (!value) {
    throw createError({ statusCode: 400, statusMessage: '缺少目标标识 (value)' })
  }

  if (action === 'remove') {
    await dbRemoveBlacklist(event, value)
    return { success: true, message: `已成功将 [${value}] 从黑名单中移除` }
  } else {
    await dbAddBlacklist(event, { type: type || 'contact', value, reason: reason || '管理员手动拉黑' })
    return { success: true, message: `已成功将 [${value}] 加入黑名单` }
  }
})
