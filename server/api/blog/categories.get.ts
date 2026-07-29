import { dbGetBlogCategories } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const categories = await dbGetBlogCategories(event)
  return {
    success: true,
    categories
  }
})
