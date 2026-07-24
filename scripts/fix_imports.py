# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\admin\security-logs.delete.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Fix import paths
content = content.replace("from '../../../utils/auth'", "from '../../utils/auth'")
content = content.replace("from '../../../utils/security-logger'", "from '../../utils/security-logger'")
content = content.replace("from '../../../utils/storage'", "from '../../utils/storage'")

with codecs.open(r'D:\Git\zpj\server\api\admin\security-logs.delete.ts', 'w', 'utf-8') as f:
    f.write(content)

print("Fixed import paths")
