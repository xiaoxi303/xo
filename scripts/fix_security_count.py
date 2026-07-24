# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\admin\security-logs.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Fix: Count both blocked and warning logs as security events
old_count = "totalBlocked: logs.filter((log) => log.status === 'blocked').length,"

new_count = "totalBlocked: logs.filter((log) => log.status === 'blocked' || log.status === 'warning').length,"

if old_count in content:
    content = content.replace(old_count, new_count)
    print("1. Updated totalBlocked to count blocked and warning logs")

# Write the file
with codecs.open(r'D:\Git\zpj\server\api\admin\security-logs.ts', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
