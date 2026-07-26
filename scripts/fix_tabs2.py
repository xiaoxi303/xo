# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Fix tabs container with CRLF
old_tabs = '        <div class="flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full whitespace-nowrap scrollbar-none"\r\n             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18); scrollbar-width: none; -ms-overflow-style: none;">'

new_tabs = '        <div class="flex items-center gap-1.5 p-1.5 rounded-xl overflow-x-auto whitespace-nowrap"\r\n             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18); scrollbar-width: thin; max-width: 100%;">'

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    print("Fixed tabs container with CRLF")
else:
    print("Not found with CRLF, trying LF...")
    old_tabs_lf = old_tabs.replace('\r\n', '\n')
    if old_tabs_lf in content:
        new_tabs_lf = new_tabs.replace('\r\n', '\n')
        content = content.replace(old_tabs_lf, new_tabs_lf)
        print("Fixed tabs container with LF")

with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
