# -*- coding: utf-8 -*-
with open(r'server/api/password-requests.post.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the contact formatting logic - simplified to use body.contact first
old_format = '''  // Format contact string: email + IP
  const contactParts = []
  if (clientEmail) {
    contactParts.push(`邮箱: ${clientEmail}`)
  } else if (body.contact && !body.contact.startsWith('IP:')) {
    contactParts.push(body.contact)
  }
  contactParts.push(`IP: ${ip} (${deviceType})`)
  const formattedContact = contactParts.join(' | ') || body.contact'''

new_format = '''  // Format contact string: use body.contact (auto-filled by frontend) + IP
  const contactParts = []
  // body.contact already contains the email from frontend auto-fill
  if (body.contact && !body.contact.startsWith('IP:')) {
    contactParts.push(body.contact)
  } else if (clientEmail) {
    contactParts.push(`邮箱: ${clientEmail}`)
  }
  contactParts.push(`IP: ${ip} (${deviceType})`)
  const formattedContact = contactParts.join(' | ') || body.contact'''

content = content.replace(old_format, new_format)

with open(r'server/api/password-requests.post.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: Now prioritizes body.contact (frontend auto-filled email)')
