import { dbSaveBlogCategories } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || !Array.isArray(body.categories)) {
    throw createError({ statusCode: 400, statusMessage: '缺少分类数据数组。' })
  }

  const savedCats = await dbSaveBlogCategories(event, body.categories)
  return {
    success: true,
    categories: savedCats
  }
})
