# -*- coding: utf-8 -*-
# Read the current file
with open(r'server/api/password-requests.post.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the entire IP extraction and contact formatting section
old_section = '''  // Extract client IP (prioritize proxy headers)
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

  // Format contact string: prefer registered email, then user input, then IP
  const contactParts = []
  if (clientEmail) {
    contactParts.push(`邮箱: ${clientEmail}`)
  } else if (body.contact && !body.contact.startsWith('IP:')) {
    contactParts.push(body.contact)
  }
  if (ip && ip !== '127.0.0.1') {
    contactParts.push(`IP: ${ip} (${deviceType})`)
  } else if (ip === '127.0.0.1') {
    contactParts.push(`IP: 本地 (${deviceType})`)
  }
  const formattedContact = contactParts.join(' | ') || body.contact || '未知联系方式' '''

new_section = '''  // Get real client IP (same logic as booking.post.ts)
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
  const deviceType = getDeviceType(userAgent)

  // Format contact string: email + IP
  const contactParts = []
  if (clientEmail) {
    contactParts.push(`邮箱: ${clientEmail}`)
  } else if (body.contact && !body.contact.startsWith('IP:')) {
    contactParts.push(body.contact)
  }
  contactParts.push(`IP: ${ip} (${deviceType})`)
  const formattedContact = contactParts.join(' | ') || body.contact'''

content = content.replace(old_section, new_section)

with open(r'server/api/password-requests.post.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: IP extraction now matches booking.post.ts logic exactly')
