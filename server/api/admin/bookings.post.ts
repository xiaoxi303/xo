import fs from 'node:fs'
import { randomBytes } from 'node:crypto'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from '../../utils/storage'
import { sendDeliveryCredentialsEmail, sendBookingOrderPaymentEmail } from '../../utils/email'
import { saveOrderPage, getOrderPage } from '../../utils/order-pages'
import {
  dbGetUsers,
  dbGetUserRecord,
  dbCreateUser,
  dbEnsureUserDeliveryCredentials,
  dbUpdateUser
} from '../../utils/db'

export default defineEventHandler(async (event) => {
  // Check admin authentication
  const adminToken = getCookie(event, SESSION_COOKIE)
  if (!adminToken || !validateSession(adminToken)) {
    throw createError({ statusCode: 401, statusMessage: '未授权的后台请求' })
  }

  const body = await readBody(event).catch(() => ({})) as any
  const action = body?.action || 'update-status'
  const id = String(body?.id || '').trim()

  const bookingsPath = getRuntimeDataPath('bookings.json')
  let bookings: any[] = readEncryptedJson<any[]>(bookingsPath, [])

  if (action === 'create-sample') {
    const sampleBooking = {
      id: `BK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: body?.name || '张制片 (示例)',
      phone: body?.phone || '13812345678',
      email: body?.email || 'producer.zhang@film-studio.com',
      company: body?.company || '未来视界影业',
      serviceType: body?.serviceType || 'tvc',
      budget: body?.budget || '30k-50k',
      timeline: body?.timeline || 'urgent',
      description: body?.description || '品牌 2026 春季汽车商业 TVC 剪辑与达芬奇电影级调色。素材为 ARRI Alexa Mini LF 4.5K RAW，需 ACEScct 调色流程与加急双屏母带监看。',
      referenceLinks: body?.referenceLinks || 'https://pan.baidu.com/s/sample-reel-2026',
      status: 'pending',
      adminNotes: '',
      ip: '127.0.0.1 (本地)',
      createdAt: new Date().toISOString()
    }
    bookings.unshift(sampleBooking)
    writeEncryptedJson(bookingsPath, bookings)
    return { success: true, booking: sampleBooking }
  }

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '缺少预约记录 ID' })
  }

  const bookingIndex = bookings.findIndex((b: any) => String(b.id) === id)
  if (bookingIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: '未找到该预约记录' })
  }

  const booking = bookings[bookingIndex]

  // ACTION: Update Status
  if (action === 'update-status') {
    const nextStatus = String(body?.status || '').trim()
    if (!['pending', 'confirmed', 'awaiting_payment', 'paid', 'converted', 'archived'].includes(nextStatus)) {
      throw createError({ statusCode: 400, statusMessage: '无效的状态值' })
    }
    booking.status = nextStatus
    booking.updatedAt = new Date().toISOString()
    writeEncryptedJson(bookingsPath, bookings)
    return { success: true, booking }
  }

  // ACTION: Update Admin Notes
  if (action === 'update-notes') {
    booking.adminNotes = String(body?.adminNotes || '').trim()
    booking.updatedAt = new Date().toISOString()
    writeEncryptedJson(bookingsPath, bookings)
    return { success: true, booking }
  }

  // ACTION: Delete
  if (action === 'delete') {
    bookings.splice(bookingIndex, 1)
    writeEncryptedJson(bookingsPath, bookings)
    return { success: true, message: '已成功删除该条预约记录' }
  }

  // ACTION: Convert to Exclusive Delivery (打通专属交付)
  if (action === 'convert-to-delivery') {
    const customSuffix = String(body?.deliverySuffix || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const users = await dbGetUsers(event)

    // Check if client already exists by email or phone
    const cleanEmail = (booking.email || '').trim().toLowerCase()
    const cleanPhone = (booking.phone || '').trim()
    
    let targetUser = users.find((u: any) => 
      (cleanEmail && (u.email || '').toLowerCase() === cleanEmail) ||
      (cleanPhone && (u.phone || '') === cleanPhone)
    )

    let deliverySuffix = customSuffix
    let deliveryKey = ''

    if (targetUser) {
      // Existing user found
      const userRecord = await dbGetUserRecord(event, targetUser.username)
      if (userRecord) {
        if (!deliverySuffix) {
          deliverySuffix = userRecord.deliverySuffix || targetUser.deliverySuffix
        }
        if (!deliverySuffix) {
          deliverySuffix = `client-${Date.now().toString(36).slice(-5)}`
        }
        
        // Generate a fresh delivery key
        deliveryKey = `dk_${randomBytes(16).toString('hex')}`
        await dbUpdateUser(event, userRecord.id ?? targetUser.id, {
          deliverySuffix,
          deliveryKey
        })
      }
    } else {
      // Generate new client user
      const rawName = (booking.name || 'client').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '')
      let baseUsername = `client_${Date.now().toString(36).slice(-6)}`
      
      if (!deliverySuffix) {
        deliverySuffix = `proj-${Date.now().toString(36).slice(-6)}`
      }

      // Check username collision
      let finalUsername = baseUsername
      let count = 1
      while (users.some((u: any) => u.username.toLowerCase() === finalUsername.toLowerCase())) {
        finalUsername = `${baseUsername}_${count++}`
      }

      const tempPassword = randomBytes(8).toString('hex')
      const credentials = await dbCreateUser(event, {
        username: finalUsername,
        email: cleanEmail || `${finalUsername}@autoclient.local`,
        password: tempPassword,
        role: 'client',
        deliverySuffix,
        deliveryKey: `dk_${randomBytes(16).toString('hex')}`
      })

      deliverySuffix = credentials.deliverySuffix
      deliveryKey = credentials.deliveryKey || ''
    }

    booking.status = 'converted'
    booking.deliverySuffix = deliverySuffix
    booking.deliveryKey = deliveryKey || `dk_${randomBytes(16).toString('hex')}`
    booking.convertedAt = new Date().toISOString()
    booking.updatedAt = new Date().toISOString()

    // Auto send email notification if client email exists
    let autoEmailRes: any = null
    if (booking.email && booking.email.includes('@')) {
      try {
        autoEmailRes = await sendDeliveryCredentialsEmail(event, {
          toEmail: booking.email,
          clientName: booking.name || '客户',
          company: booking.company,
          deliverySuffix: booking.deliverySuffix,
          deliveryKey: booking.deliveryKey,
          serviceType: booking.serviceType,
          description: booking.description
        })
        if (autoEmailRes?.success) {
          booking.emailSent = true
          booking.emailSentAt = new Date().toISOString()
        }
      } catch (e: any) {
        console.warn('Auto send delivery email on convert failed:', e.message)
      }
    }

    writeEncryptedJson(bookingsPath, bookings)

    return {
      success: true,
      booking,
      deliverySuffix: booking.deliverySuffix,
      deliveryKey: booking.deliveryKey,
      deliveryUrl: `/delivery/${encodeURIComponent(booking.deliverySuffix)}`,
      emailResult: autoEmailRes
    }
  }

  
  // ACTION: Send Delivery Credentials Email (手动发送/重发交付凭证邮件)
  if (action === 'send-delivery-email') {
    if (!booking.email || !booking.email.includes('@')) {
      throw createError({ statusCode: 400, statusMessage: '该预约记录未填写有效的电子邮箱' })
    }
    if (!booking.deliverySuffix) {
      throw createError({ statusCode: 400, statusMessage: '该预约尚未开通专属交付放映室，请先点击转专属交付' })
    }

    const emailRes = await sendDeliveryCredentialsEmail(event, {
      toEmail: booking.email,
      clientName: booking.name || '客户',
      company: booking.company,
      deliverySuffix: booking.deliverySuffix,
      deliveryKey: booking.deliveryKey || '',
      serviceType: booking.serviceType,
      description: booking.description
    })

    if (!emailRes.success) {
      throw createError({ statusCode: 500, statusMessage: emailRes.message || '邮件发送失败，请检查后台 SMTP 邮件通知配置' })
    }

    booking.emailSent = true
    booking.emailSentAt = new Date().toISOString()
    booking.updatedAt = new Date().toISOString()
    writeEncryptedJson(bookingsPath, bookings)

    return {
      success: true,
      message: `已成功发送交付凭证邮件至 ${booking.email}`,
      emailSentAt: booking.emailSentAt
    }
  }

  // ACTION: Create / Connect Order Page (填写价格生成订单页面并可选一键发信)
  if (action === 'create-order') {
    const rawAmount = Number(body?.amount)
    if (!Number.isFinite(rawAmount) || rawAmount < 0.01 || rawAmount > 1000000) {
      throw createError({ statusCode: 400, statusMessage: '请输入有效的订单金额（0.01 - 1,000,000 元）' })
    }
    const amountStr = rawAmount.toFixed(2)

    let orderSuffix = String(body?.orderSuffix || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!orderSuffix) {
      orderSuffix = (booking.company || booking.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 16) || `order-${booking.id.slice(-6)}`
    }

    const subject = String(body?.subject || '').trim() || `${booking.name || '客户'}影视定制服务款`
    const description = String(body?.description || '').trim() || (booking.description ? booking.description.slice(0, 150) : '项目定制款项')
    const successText = String(body?.successText || '支付成功！我们将尽快推进后期制作与母带交付。').trim()
    const autoSendEmail = Boolean(body?.sendEmail)

    // Check if client is registered to bind their username
    const users = await dbGetUsers(event)
    const cleanEmail = (booking.email || '').trim().toLowerCase()
    const cleanPhone = (booking.phone || '').trim()
    const targetUser = users.find((u: any) => 
      (cleanEmail && (u.email || '').toLowerCase() === cleanEmail) ||
      (cleanPhone && (u.phone || '') === cleanPhone)
    )
    const clientUsername = targetUser ? targetUser.username : (body?.clientUsername || '')

    // Save or update order page
    const pageConfig = saveOrderPage({
      suffix: orderSuffix,
      enabled: true,
      subject,
      amount: amountStr,
      description,
      clientName: booking.name || '',
      clientUsername,
      bookingId: booking.id,
      successText
    })

    // Update booking info and advance status to awaiting_payment
    booking.orderSuffix = orderSuffix
    booking.orderAmount = amountStr
    booking.orderSubject = subject
    booking.orderDescription = description
    booking.orderCreatedAt = new Date().toISOString()
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      booking.status = 'awaiting_payment'
    }
    booking.updatedAt = new Date().toISOString()

    let emailResult = null
    if (autoSendEmail && booking.email && booking.email.includes('@')) {
      emailResult = await sendBookingOrderPaymentEmail(event, {
        toEmail: booking.email,
        clientName: booking.name || '客户',
        company: booking.company,
        orderSuffix,
        subject,
        amount: amountStr,
        description,
        bookingId: booking.id
      })
      if (emailResult.success) {
        booking.orderEmailSent = true
        booking.orderEmailSentAt = new Date().toISOString()
      }
    }

    writeEncryptedJson(bookingsPath, bookings)

    return {
      success: true,
      booking,
      orderPage: pageConfig,
      orderUrl: `/order/${encodeURIComponent(orderSuffix)}`,
      emailResult
    }
  }

  // ACTION: Send / Resend Order Payment Email
  if (action === 'send-order-email') {
    if (!booking.email || !booking.email.includes('@')) {
      throw createError({ statusCode: 400, statusMessage: '该预约未填写有效的电子邮箱' })
    }
    if (!booking.orderSuffix || !booking.orderAmount) {
      throw createError({ statusCode: 400, statusMessage: '尚未为此预约生成订单，请先点击填写价格生成订单' })
    }

    const emailRes = await sendBookingOrderPaymentEmail(event, {
      toEmail: booking.email,
      clientName: booking.name || '客户',
      company: booking.company,
      orderSuffix: booking.orderSuffix,
      subject: booking.orderSubject || `${booking.name || '客户'}定制项目结算款`,
      amount: booking.orderAmount,
      description: booking.orderDescription || booking.description,
      bookingId: booking.id
    })

    if (!emailRes.success) {
      throw createError({ statusCode: 500, statusMessage: emailRes.message || '邮件发送失败，请检查 SMTP 配置' })
    }

    booking.orderEmailSent = true
    booking.orderEmailSentAt = new Date().toISOString()
    booking.updatedAt = new Date().toISOString()
    writeEncryptedJson(bookingsPath, bookings)

    return {
      success: true,
      message: `已成功发送订单账单邮件至 ${booking.email}`,
      orderEmailSentAt: booking.orderEmailSentAt
    }
  }

  throw createError({ statusCode: 400, statusMessage: '不支持的 action' })
})
