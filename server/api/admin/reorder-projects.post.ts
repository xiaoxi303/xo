import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { validateSession, SESSION_COOKIE } from '../../utils/auth'
import { dbReorderProjects } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const body = await readBody(event)
  const slugs = body?.slugs

  if (!Array.isArray(slugs) || slugs.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请提供作品排序 slug 数组。' })
  }

  await dbReorderProjects(event, slugs)

  return { success: true }
})
