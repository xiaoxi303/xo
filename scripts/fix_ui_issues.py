# -*- coding: utf-8 -*-
import codecs

# Fix admin page tabs navigation
f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Fix the tabs container to allow proper scrolling
old_tabs_container = '''        <div class="flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full whitespace-nowrap scrollbar-none"
             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18); scrollbar-width: none; -ms-overflow-style: none;">'''

new_tabs_container = '''        <div class="flex items-center gap-1 p-1 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-none"
             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18); scrollbar-width: none; -ms-overflow-style: none; max-width: 100%;">'''

if old_tabs_container in content:
    content = content.replace(old_tabs_container, new_tabs_container)
    print("Fixed tabs container")

# Fix booking page emojis
f2 = codecs.open(r'D:\Git\zpj\app\pages\booking\index.vue', 'r', 'utf-8')
booking_content = f2.read()
f2.close()

# Replace literal escape sequences with actual emojis
booking_content = booking_content.replace('\\U0001f4c5', '\U0001f4c5')
booking_content = booking_content.replace('\\U0001f3ac', '\U0001f3ac')
booking_content = booking_content.replace('\\U0001f3a8', '\U0001f3a8')
booking_content = booking_content.replace('\\U0001f4f9', '\U0001f4f9')
booking_content = booking_content.replace('\\U0001f3b5', '\U0001f3b5')
booking_content = booking_content.replace('\\U0001f4dd', '\U0001f4dd')
booking_content = booking_content.replace('\\u2713', '\u2713')

with codecs.open(r'D:\Git\zpj\app\pages\booking\index.vue', 'w', 'utf-8') as f:
    f.write(booking_content)

print("Fixed booking emojis")

# Write admin file
with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("All files saved!")
