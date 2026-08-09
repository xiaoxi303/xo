import { dbDeleteBlogPost } from '../../utils/db'
import { requireAdminSession } from '../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))
  const id = (query.id as string) || body.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '缺少文章 ID。' })
  }

  await dbDeleteBlogPost(event, id)
  return {
    success: true
  }
})
