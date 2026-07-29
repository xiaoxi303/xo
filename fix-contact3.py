# -*- coding: utf-8 -*-
with open(r'server/api/password-requests.post.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: Always use registered email for logged-in users, and format contact properly
old_format = '''  // Format contact string with email and IP
  const contactParts = []
  if (body.contact) contactParts.push(body.contact)
  else if (clientEmail) contactParts.push(`邮箱: ${clientEmail}`)
  if (ip) contactParts.push(`IP: ${ip} (${deviceType})`)
  const formattedContact = contactParts.join(' | ') || body.contact'''

new_format = '''  // Format contact string: prefer registered email, then user input, then IP
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

content = content.replace(old_format, new_format)

with open(r'server/api/password-requests.post.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: Contact format now prioritizes registered email')
