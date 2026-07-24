# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\auth\client-login.post.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Update the user not found section
old_not_found = '''  if (!userRecord) {
    logSecurityEvent({
      type: 'Client Token Guard',
      ip,
      action: `Failed client login for username "${username}"`,
      status: 'blocked'
    })
    // Artificial delay to prevent brute force timing attacks
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '\u7528\u6237\u540d\u6216\u5bc6\u7801\u9519\u8bef\u3002' })
  }'''

new_not_found = '''  if (!userRecord) {
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Login attempt for non-existent user "${username}"`,
      status: 'warning'
    })
    // Artificial delay to prevent brute force timing attacks
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 404, statusMessage: '\u8be5\u8d26\u6237\u4e0d\u5b58\u5728\uff0c\u8bf7\u5148\u6ce8\u518c\u3002' })
  }'''

if old_not_found in content:
    content = content.replace(old_not_found, new_not_found)
    print("1. Updated user not found message")

# Update the password wrong section
old_wrong_pwd = '''  // Verify client password
  if (!verifyPassword(password, userRecord.password)) {
    logSecurityEvent({
      type: 'Client Token Guard',
      ip,
      action: `Failed client login for username "${username}"`,
      status: 'blocked'
    })
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '\u7528\u6237\u540d\u6216\u5bc6\u7801\u9519\u8bef\u3002' })
  }'''

new_wrong_pwd = '''  // Verify client password
  if (!verifyPassword(password, userRecord.password)) {
    logSecurityEvent({
      type: 'Client Login Guard',
      ip,
      action: `Wrong password for user "${username}"`,
      status: 'blocked'
    })
    await new Promise(resolve => setTimeout(resolve, 800))
    throw createError({ statusCode: 401, statusMessage: '\u5bc6\u7801\u9519\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165\u3002' })
  }'''

if old_wrong_pwd in content:
    content = content.replace(old_wrong_pwd, new_wrong_pwd)
    print("2. Updated wrong password message")

# Write the file
with codecs.open(r'D:\Git\zpj\server\api\auth\client-login.post.ts', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
