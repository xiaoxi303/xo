import { dbDeleteUser, dbGetUsers } from '../../utils/db'
import { validateSession, SESSION_COOKIE, destroyAllUserSessions } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const query = getQuery(event)
  const id = query.id as string

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少用户 ID。'
    })
  }

  try {
    const users = await dbGetUsers(event).catch(() => [])
    const targetUser = users.find((u: any) => String(u.id) === String(id))
    if (targetUser?.username) {
      destroyAllUserSessions(targetUser.username)
    }
    await dbDeleteUser(event, id)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '删除用户失败。'
    })
  }
})
