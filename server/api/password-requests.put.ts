import { dbUpdatePasswordRequestStatus } from '../utils/db'
import { validateSession, SESSION_COOKIE } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const body = await readBody(event)
  const { id, status } = body || {}

  if (!id || !status) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少请求 ID 或状态。'
    })
  }

  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
    throw createError({
      statusCode: 400,
      statusMessage: '无效的审核状态。'
    })
  }

  try {
    await dbUpdatePasswordRequestStatus(event, id, status)

    if (status === 'approved') {
      // Fetch request details to send email notification
      const { dbGetPasswordRequests } = await import('../utils/db')
      const requests = await dbGetPasswordRequests(event)
      const req = requests.find((r: any) => String(r.id) === String(id))
      if (req) {
        const { sendApprovalEmail } = await import('../utils/email')
        // Send email asynchronously in the background
        sendApprovalEmail(event, req).catch(err => {
          console.error('Background approval email failed:', err)
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to update password request status:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新审核状态失败。'
    })
  }
})
