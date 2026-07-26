# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Replace Unicode escape sequences with actual emojis in bookings section
replacements = [
    ("\\U0001f4c5 \u5408\u4f5c\u9884\u7ea6\u7ba1\u7406", "\U0001f4c5 \u5408\u4f5c\u9884\u7ea6\u7ba1\u7406"),
    ("\\U0001f4cb", "\U0001f4cb"),
    ("\\U0001f3ac", "\U0001f3ac"),
    ("\\U0001f3a8", "\U0001f3a8"),
    ("\\U0001f4f9", "\U0001f4f9"),
    ("\\U0001f3b5", "\U0001f3b5"),
    ("\\U0001f4c1", "\U0001f4c1"),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"Replaced: {old[:20]}...")

with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
