# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\projects\[slug]\unlock.post.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Add import for logSecurityEvent and getRequestIP
old_import = '''import { dbGetProjectPassword } from '../../../utils/db'
import { randomBytes } from 'crypto' '''

new_import = '''import { dbGetProjectPassword } from '../../../utils/db'
import { randomBytes } from 'crypto'
import { logSecurityEvent } from '../../../utils/security-logger' '''

if old_import in content:
    content = content.replace(old_import, new_import)
    print("1. Import added")
else:
    print("1. Import not found")

# Add security logging for failed password attempts
old_password_check = '''  if (password !== storedPassword) {
    // Artificial delay to resist brute-force
    await new Promise(r => setTimeout(r, 600))
    throw createError({ statusCode: 401, statusMessage: '\u5bc6\u7801\u9519\u8bef\uff0c\u8bf7\u8054\u7cfb\u4f5c\u8005\u83b7\u53d6\u6388\u6743\u5bc6\u7801\u3002' })
  }'''

new_password_check = '''  if (password !== storedPassword) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    logSecurityEvent({
      type: 'Project Password Guard',
      ip,
      action: `Failed password attempt for project "${slug}"`,
      status: 'blocked'
    })
    // Artificial delay to resist brute-force
    await new Promise(r => setTimeout(r, 600))
    throw createError({ statusCode: 401, statusMessage: '\u5bc6\u7801\u9519\u8bef\uff0c\u8bf7\u8054\u7cfb\u4f5c\u8005\u83b7\u53d6\u6388\u6743\u5bc6\u7801\u3002' })
  }'''

if old_password_check in content:
    content = content.replace(old_password_check, new_password_check)
    print("2. Security logging added for failed password attempts")
else:
    print("2. Password check not found")

# Write the file
with codecs.open(r'D:\Git\zpj\server\api\projects\[slug]\unlock.post.ts', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
