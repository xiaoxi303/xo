# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\projects\[slug]\unlock.post.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Add import for logSecurityEvent
old_import = "import { randomBytes } from 'crypto'"
new_import = "import { randomBytes } from 'crypto'\nimport { logSecurityEvent } from '../../../utils/security-logger'"

if old_import in content:
    content = content.replace(old_import, new_import)
    print("1. Import added")
else:
    print("1. Import not found")

# Write the file
with codecs.open(r'D:\Git\zpj\server\api\projects\[slug]\unlock.post.ts', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
