import { dbCreatePasswordRequest } from '../utils/db'
import { validateSession, CLIENT_SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.clientName || !body.contact || !body.projectSlug || !body.projectTitle) {
    throw createError({
      statusCode: 400,
      statusMessage: '客户姓名、联系方式、项目信息为必填项。'
    })
  }

  // Retrieve client username if logged in
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username
    }
  }

  try {
    await dbCreatePasswordRequest(event, {
      ...body,
      clientUsername
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to create password request:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '提交申请失败，请稍后重试。'
    })
  }
})
