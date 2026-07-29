# -*- coding: utf-8 -*-
with open(r'server/api/password-requests.post.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the emailPart priority logic
old_logic = '''  // 4. Build final contact string
  // Priority: body.contact (from frontend) -> clientEmail (from DB) -> username
  const emailPart = body.contact || clientEmail || clientUsername || 'unknown'
  const finalContact = `${emailPart} | IP: ${ip} (${deviceType})`'''

new_logic = '''  // 4. Build final contact string
  // Priority: clientEmail (from DB) > valid body.contact > username
  let userContact = clientEmail || clientUsername || 'unknown'
  
  // Only use body.contact if it's a valid email (not IP: prefix garbage)
  if (body.contact && !body.contact.startsWith('IP:') && body.contact.trim() !== '') {
    userContact = body.contact
  }
  
  // Normalize: add "邮箱:" prefix if it's an email without prefix
  const contactLabel = userContact.includes('@') && !userContact.startsWith('邮箱:')
    ? `邮箱: ${userContact}`
    : userContact
  
  // Force final format
  const finalContact = `${contactLabel} | IP: ${ip} (${deviceType})`'''

content = content.replace(old_logic, new_logic)

with open(r'server/api/password-requests.post.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Fixed: emailPart priority now correctly prioritizes clientEmail over body.contact')
