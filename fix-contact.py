# -*- coding: utf-8 -*-
with open(r'server/api/password-requests.post.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add device detection helper and format contact info
old_code = '''  // Retrieve client username if logged in
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username
    }
  }

  // Extract client IP
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) ip = cfConnectingIp.trim()
  else if (xRealIp) ip = xRealIp.trim()
  else if (xForwardedFor) ip = xForwardedFor.split(',')[0]?.trim() || ''
  if (!ip) ip = getRequestIP(event, { xForwardedFor: true }) || '未知 IP'
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

  // Perform rate-limit and blacklist / whitelist check
  const check = await dbCheckRateLimitAndBlacklist(event, {
    username: clientUsername,
    contact: body.contact,
    ip
  })

  // Determine status and reason
  let status = 'approved'
  let reason = check.isWhitelisted ? '白名单客户自动通过' : '防刷校验通过，系统自动授权'

  if (check.isBlacklisted) {
    status = 'pending'
    reason = check.reason || '已被系统防刷保护或黑名单拦截，需管理员手动审核'
  }

  const requestData = {
    ...body,
    clientUsername,
    ip,
    status,
    reason,
    isBlacklisted: check.isBlacklisted,
    isAutoBlacklisted: check.isAutoBlacklisted || false
  }'''

new_code = '''  // Helper: detect device type from user-agent
  const getDeviceType = (ua: string): string => {
    if (!ua) return 'Unknown'
    const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone']
    return mobileKeywords.some(k => ua.includes(k)) ? 'Mobile' : 'PC'
  }

  // Retrieve client info if logged in
  const token = getCookie(event, CLIENT_SESSION_COOKIE)
  let clientUsername = ''
  let clientEmail = ''
  if (token) {
    const session = validateSession(token)
    if (session) {
      clientUsername = session.username || ''
      clientEmail = session.email || ''
    }
  }

  // Extract client IP (prioritize proxy headers)
  let ip = ''
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  const xRealIp = getHeader(event, 'x-real-ip')
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  
  if (cfConnectingIp) ip = cfConnectingIp.trim()
  else if (xRealIp) ip = xRealIp.trim()
  else if (xForwardedFor) ip = xForwardedFor.split(',')[0]?.trim() || ''
  if (!ip) ip = getRequestIP(event, { xForwardedFor: true }) || '未知 IP'
  // Don't mask local IPs - they indicate proxy misconfiguration
  if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1'

  // Detect device type
  const userAgent = getHeader(event, 'user-agent') || ''
  const deviceType = getDeviceType(userAgent)

  // Format contact string with email and IP
  const contactParts = []
  if (body.contact) contactParts.push(body.contact)
  else if (clientEmail) contactParts.push(`邮箱: ${clientEmail}`)
  if (ip) contactParts.push(`IP: ${ip} (${deviceType})`)
  const formattedContact = contactParts.join(' | ') || body.contact

  // Perform rate-limit and blacklist / whitelist check
  const check = await dbCheckRateLimitAndBlacklist(event, {
    username: clientUsername,
    contact: body.contact,
    ip
  })

  // Determine status and reason
  let status = 'approved'
  let reason = check.isWhitelisted ? '白名单客户自动通过' : '防刷校验通过，系统自动授权'

  if (check.isBlacklisted) {
    status = 'pending'
    reason = check.reason || '已被系统防刷保护或黑名单拦截，需管理员手动审核'
  }

  const requestData = {
    ...body,
    contact: formattedContact,
    clientUsername,
    clientEmail,
    ip,
    deviceType,
    status,
    reason,
    isBlacklisted: check.isBlacklisted,
    isAutoBlacklisted: check.isAutoBlacklisted || false
  }'''

content = content.replace(old_code, new_code)

with open(r'server/api/password-requests.post.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: Added email and device detection to password-requests.post.ts')
