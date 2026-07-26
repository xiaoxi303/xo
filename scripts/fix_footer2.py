# -*- coding: utf-8 -*-
import codecs

# Fix AppFooter - remove or minimize the divider
f = codecs.open(r'D:\Git\zpj\app\components\AppFooter.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Replace the divider with a minimal one or remove it
old_divider = '''    <!-- Premium thin gradient divider -->
    <div class="max-w-6xl mx-auto px-6 mb-8">
      <div class="h-[1px] w-full" style="background: linear-gradient(90deg, transparent, var(--color-border) 15%, var(--color-border) 85%, transparent);" />
    </div>'''

new_divider = '''    <!-- Minimal divider -->
    <div class="max-w-6xl mx-auto px-6 mb-6">
      <div class="h-[1px] w-full opacity-30" style="background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1) 15%, rgba(0,0,0,0.1) 85%, transparent);" />
    </div>'''

if old_divider in content:
    content = content.replace(old_divider, new_divider)
    print("Fixed footer divider")

with codecs.open(r'D:\Git\zpj\app\components\AppFooter.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
