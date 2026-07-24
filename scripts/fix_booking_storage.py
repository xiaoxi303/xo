# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\api\booking.post.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Fix the wrong import path
content = content.replace("from '../../utils/storage'", "from '../utils/storage'")

with codecs.open(r'D:\Git\zpj\server\api\booking.post.ts', 'w', 'utf-8') as f:
    f.write(content)

print("Fixed storage import path in booking.post.ts")
