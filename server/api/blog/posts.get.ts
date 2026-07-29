import { dbGetBlogPosts } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const posts = await dbGetBlogPosts(event)
  return {
    success: true,
    posts
  }
})
