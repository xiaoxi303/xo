# -*- coding: utf-8 -*-
with open(r'server/api/projects/[slug]/get-password-direct.get.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the IP extraction and contact formatting
old_code = '''  // Log request
  let ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

  const reqObj = {
    clientName: 'Direct Access (' + session.username + ')',
    contact: 'IP: ' + ip,
    projectSlug: slug,
    projectTitle: projectTitle,
    clientUsername: session.username,
    status: 'approved'
  }

  await dbCreatePasswordRequest(event, reqObj)

  // Look up user email and send notification
  try {
    const users = await dbGetUsers(event)
    const user = users.find((u: any) => u.username === session.username)
    if (user && user.email) {
      reqObj.contact = user.email
      sendApprovalEmail(event, reqObj).catch(err => {
        console.error('Failed to send direct access email:', err)
      })
    }
  } catch (e) {
    console.error('Failed to lookup user email:', e)
  }'''

new_code = '''  // Get real client IP (same logic as booking.post.ts)
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) ip = cfConnectingIp.trim()
  else if (xRealIp) ip = xRealIp.trim()
  else if (xForwardedFor) ip = xForwardedFor.split(',')[0]?.trim() || ''
  if (!ip) ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

  // Detect device type
  const userAgent = getHeader(event, 'user-agent') || ''
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
  const deviceType = isMobile ? 'Mobile' : 'PC'

  // Look up user email from database
  let clientEmail = ''
  try {
    const users = await dbGetUsers(event)
    const user = users.find((u: any) => u.username === session.username)
    if (user) {
      clientEmail = user.email || ''
    }
  } catch (e) {
    console.error('Failed to lookup user email:', e)
  }

  // Format contact: email + IP
  const emailPart = clientEmail || session.username || 'unknown'
  const contactLabel = emailPart.includes('@') ? `邮箱: ${emailPart}` : emailPart
  const finalContact = `${contactLabel} | IP: ${ip} (${deviceType})`

  console.log('[get-password-direct] clientEmail:', clientEmail)
  console.log('[get-password-direct] Real IP:', ip)
  console.log('[get-password-direct] finalContact:', finalContact)

  const reqObj = {
    clientName: 'Direct Access (' + session.username + ')',
    contact: finalContact,
    projectSlug: slug,
    projectTitle: projectTitle,
    clientUsername: session.username,
    clientEmail,
    ip,
    deviceType,
    status: 'approved'
  }

  await dbCreatePasswordRequest(event, reqObj)

  // Send email notification
  if (clientEmail) {
    sendApprovalEmail(event, reqObj).catch(err => {
      console.error('Failed to send direct access email:', err)
    })
  }'''

content = content.replace(old_code, new_code)

with open(r'server/api/projects/[slug]/get-password-direct.get.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: get-password-direct.get.ts - IP extraction and contact formatting')
