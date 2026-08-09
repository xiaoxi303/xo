import { dbSaveBlogPost } from '../../utils/db'
import { requireAdminSession } from '../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const body = await readBody(event)
  if (!body || !body.post) {
    throw createError({ statusCode: 400, statusMessage: '缺少文章数据对象。' })
  }

  const savedPost = await dbSaveBlogPost(event, body.post)
  return {
    success: true,
    post: savedPost
  }
})
