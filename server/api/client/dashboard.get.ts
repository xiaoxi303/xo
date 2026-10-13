import fs from 'node:fs'
import { defineEventHandler, getCookie, createError } from 'h3'
import { validateSession, CLIENT_SESSION_COOKIE } from '../../utils/auth'
import { dbGetProjectsRaw, dbGetPasswordRequests, dbGetUsers, dbGetUserRecord } from '../../utils/db'
import { getDailyPassword } from '../../utils/password-utils'
import { getRuntimeDataPath } from '../../utils/storage'
import { getOrders } from '../../utils/order-store'
import { getOrderPages } from '../../utils/order-pages'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: '未登录客户账号。' })
  }

  const session = validateSession(token)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: '会话已过期，请重新登录。' })
  }

  const username = session.username

  // 1. Get client user profile and raw record
  const allUsers = await dbGetUsers(event).catch(() => [])
  const foundUser = allUsers.find((u: any) => u.username === username)

  if (!foundUser) {
    throw createError({ statusCode: 404, statusMessage: '客户账号不存在。' })
  }

  const rawUserRecord = await dbGetUserRecord(event, username).catch(() => null)
  const { password: _p, ...clientProfile } = foundUser
  const clientEmail = (clientProfile.email || '').trim().toLowerCase()
  const clientPhone = (clientProfile.phone || '').trim()

  // 2. Fetch bookings to match any converted delivery for this user
  const bookingsPath = getRuntimeDataPath('bookings.json')
  let bookings: any[] = []
  try {
    if (fs.existsSync(bookingsPath)) {
      bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'))
    }
  } catch {
    bookings = []
  }

  const clientSuffix = (rawUserRecord?.deliverySuffix || clientProfile.deliverySuffix || '').trim().toLowerCase()
  const matchingBooking = bookings.find((b: any) => {
    if (clientSuffix && String(b.deliverySuffix || '').trim().toLowerCase() === clientSuffix) return true
    if (clientEmail && String(b.email || '').trim().toLowerCase() === clientEmail) return true
    if (clientPhone && String(b.phone || '').trim() === clientPhone) return true
    return false
  })

  const deliverySuffix = clientSuffix || matchingBooking?.deliverySuffix || ''
  const deliveryKey = matchingBooking?.deliveryKey || rawUserRecord?.deliveryPlainKey || rawUserRecord?.deliveryKey || ''

  const deliveryInfo = deliverySuffix ? {
    suffix: deliverySuffix,
    key: deliveryKey,
    hint: rawUserRecord?.deliveryKeyHint || (deliveryKey ? deliveryKey.slice(-4) : ''),
    hasAccess: Boolean(deliveryKey),
    booking: matchingBooking ? {
      id: matchingBooking.id,
      name: matchingBooking.name,
      company: matchingBooking.company,
      serviceType: matchingBooking.serviceType,
      budget: matchingBooking.budget,
      timeline: matchingBooking.timeline,
      description: matchingBooking.description,
      status: matchingBooking.status,
      convertedAt: matchingBooking.convertedAt || matchingBooking.createdAt
    } : null
  } : null

  // 3. Fetch all password requests & projects
  const allRequests = await dbGetPasswordRequests(event).catch(() => [])
  const allProjects = await dbGetProjectsRaw(event).catch(() => [])

  // Filter requests belonging to this user
  const clientRequests = allRequests.filter((r: any) => {
    if (r.clientUsername && r.clientUsername === username) return true
    if (r.clientName && r.clientName.includes(`账号: ${username}`)) return true
    if (clientEmail && r.contact && r.contact.toLowerCase().includes(clientEmail)) return true
    return false
  })

  // Attach calculated password for request's application date (r.createdAt)
  const enrichedRequests = clientRequests.map((r: any) => {
    const project = allProjects.find((p: any) => p.slug === r.projectSlug)
    let projectPwd = ''
    if (project) {
      if (project.autoRotatePassword !== false) {
        // Calculate password for the exact date the request was submitted (r.createdAt)
        projectPwd = getDailyPassword(project.slug, undefined, r.createdAt)
      } else {
        projectPwd = project.password || ''
      }
    }

    return {
      ...r,
      password: r.status === 'approved' ? projectPwd : '',
      projectImage: project?.image || ''
    }
  })

  // 4. Build allowed projects list STRICTLY from admin User Management selection (clientProfile.allowedProjects)
  const allowedSlugsSet = new Set<string>(
    (clientProfile.allowedProjects || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
  )

  const allowedProjects = allProjects
    .filter((p: any) => allowedSlugsSet.has(p.slug))
    .map((p: any) => {
      let pwd = ''
      if (p.autoRotatePassword !== false) {
        pwd = getDailyPassword(p.slug)
      } else {
        pwd = p.password || ''
      }
      return {
        slug: p.slug,
        title: p.title,
        image: p.image,
        description: p.description,
        password: pwd
      }
    })

  // 5. Fetch Orders and Order Pages associated with this client
  const allOrders = getOrders()
  const allOrderPages = getOrderPages()

  // Find pages explicitly assigned to this user, or matching user's deliverySuffix/username
  const clientAssignedPages = allOrderPages.filter(p => {
    if (p.clientUsername && p.clientUsername === username) return true
    if (clientSuffix && p.suffix === clientSuffix) return true
    if (p.suffix === username) return true
    if (clientProfile.nickname && p.clientName && p.clientName === clientProfile.nickname) return true
    return false
  })

  const clientAssignedSuffixes = new Set(clientAssignedPages.map(p => p.suffix))

  // Match orders for this client
  const clientOrders = allOrders.filter(o => {
    if (o.clientUsername && o.clientUsername === username) return true
    if (clientAssignedSuffixes.has(o.suffix)) return true
    if (clientSuffix && o.suffix === clientSuffix) return true
    if (o.suffix === username) return true
    if (o.clientName && (o.clientName === username || (clientProfile.nickname && o.clientName === clientProfile.nickname))) return true
    return false
  })

  // Enrich orders with product/page details
  const enrichedOrders = clientOrders.map(o => {
    const page = allOrderPages.find(p => p.suffix === o.suffix)
    return {
      ...o,
      pageDescription: page?.description || '',
      pageSubject: page?.subject || o.subject,
      pageUrl: `/order/${o.suffix}`,
      deliverySuffix: deliverySuffix || o.suffix,
      successText: page?.successText || ''
    }
  })

  // Order summary metrics
  const paidOrders = enrichedOrders.filter(o => o.status === 'paid')
  const pendingOrders = enrichedOrders.filter(o => o.status === 'created')
  const totalPaidAmount = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)

  // Also include assigned active pages that client can purchase/review directly
  const availableProducts = clientAssignedPages
    .filter(p => p.enabled)
    .map(p => ({
      suffix: p.suffix,
      subject: p.subject,
      amount: p.amount,
      description: p.description,
      clientName: p.clientName,
      successText: p.successText,
      pageUrl: `/order/${p.suffix}`,
      hasOrder: clientOrders.some(o => o.suffix === p.suffix),
      isPaid: clientOrders.some(o => o.suffix === p.suffix && o.status === 'paid')
    }))

  const orderSummary = {
    totalOrders: enrichedOrders.length,
    paidCount: paidOrders.length,
    pendingCount: pendingOrders.length,
    totalPaid: totalPaidAmount.toFixed(2),
    availableProducts
  }

  return {
    profile: {
      ...clientProfile,
      deliverySuffix,
      deliveryKey
    },
    delivery: deliveryInfo,
    allowedProjects,
    requests: enrichedRequests,
    orders: enrichedOrders,
    orderSummary
  }
})
