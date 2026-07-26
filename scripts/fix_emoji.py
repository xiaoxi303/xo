# -*- coding: utf-8 -*-
import codecs

# Fix booking page - replace Unicode escape sequences with actual emojis
f = codecs.open(r'D:\Git\zpj\app\pages\booking\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Replace all Unicode escape sequences with actual emojis
replacements = {
    '\\U0001f4c5': '\U0001f4c5',  # 📅
    '\\U0001f3ac': '\U0001f3ac',  # 🎬
    '\\U0001f3a8': '\U0001f3a8',  # 🎨
    '\\U0001f4f9': '\U0001f4f9',  # 📹
    '\\U0001f3b5': '\U0001f3b5',  # 🎵
    '\\U0001f4dd': '\U0001f4dd',  # 📝
    '\\u2713': '\u2713',          # ✓
    '\\u8fd4\\u56de\\u9996\\u9875': '\u8fd4\u56de\u9996\u9875',
    '\\u5408\\u4f5c\\u9884\\u7ea6': '\u5408\u4f5c\u9884\u7ea6',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Also decode any remaining unicode escapes
import re
def decode_unicode_escapes(text):
    def replace_match(match):
        try:
            return chr(int(match.group(1), 16))
        except:
            return match.group(0)
    return re.sub(r'\\u([0-9a-fA-F]{4})', replace_match, text)

content = decode_unicode_escapes(content)

with codecs.open(r'D:\Git\zpj\app\pages\booking\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("Fixed booking/index.vue")
