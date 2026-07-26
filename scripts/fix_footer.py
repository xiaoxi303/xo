# -*- coding: utf-8 -*-
import codecs

# Fix AppFooter - reduce margin-top to eliminate gray gap
f = codecs.open(r'D:\Git\zpj\app\components\AppFooter.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Reduce the margin-top from mt-28 to mt-16
old_footer = '<footer class="relative z-10 mt-28 pt-20 pb-16">'
new_footer = '<footer class="relative z-10 mt-16 pt-12 pb-12">'

if old_footer in content:
    content = content.replace(old_footer, new_footer)
    print("Reduced footer margin-top")

# Also reduce the divider margin
old_divider = '<div class="max-w-6xl mx-auto px-6 mb-12">'
new_divider = '<div class="max-w-6xl mx-auto px-6 mb-8">'

if old_divider in content:
    content = content.replace(old_divider, new_divider)
    print("Reduced divider margin")

with codecs.open(r'D:\Git\zpj\app\components\AppFooter.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
