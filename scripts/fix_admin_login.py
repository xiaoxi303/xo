# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\auth\login.post.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Update the admin login check to separate username and password errors
old_check = '''  if (username !== allowedUsername || !verifyPassword(password, allowedPasswordHash)) {
    logSecurityEvent({
      type: 'Token Session Guard',
      ip,
      action: `Failed admin login for username "${username}"`,
      status: 'blocked'
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '\u7528\u6237\u540d\u6216\u5bc6\u7801\u9519\u8bef\u3002' })
  }'''

new_check = '''  // Check username first
  if (username !== allowedUsername) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Login attempt for non-existent admin "${username}"`,
      status: 'warning'
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    throw createError({ statusCode: 404, statusMessage: '\u8be5\u7ba1\u7406\u8d26\u6237\u4e0d\u5b58\u5728\u3002' })
  }
  
  // Then check password
  if (!verifyPassword(password, allowedPasswordHash)) {
    logSecurityEvent({
      type: 'Admin Login Guard',
      ip,
      action: `Wrong password for admin "${username}"`,
      status: 'blocked'
    })
    await new Promise((resolve) => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '\u7ba1\u7406\u5458\u5bc6\u7801\u9519\u8bef\u3002' })
  }'''

if old_check in content:
    content = content.replace(old_check, new_check)
    print("Updated admin login check")
else:
    print("Pattern not found")

# Write the file
with codecs.open(r'D:\Git\zpj\server\api\auth\login.post.ts', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
