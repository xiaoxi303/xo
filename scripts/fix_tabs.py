# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Fix tabs container - allow it to expand and scroll properly
old_tabs = '''        <div class="flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full whitespace-nowrap scrollbar-none"
             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18); scrollbar-width: none; -ms-overflow-style: none;">'''

new_tabs = '''        <div class="flex items-center gap-1.5 p-1.5 rounded-xl overflow-x-auto whitespace-nowrap"
             style="background: rgba(140,115,80,0.08); border: 1px solid rgba(160,130,90,0.18); scrollbar-width: thin; scrollbar-color: rgba(180,150,110,0.3) transparent;">'''

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    print("Fixed tabs container")
else:
    print("Tabs container not found")

# Also fix the button padding to be more compact
old_btn = "'relative px-3.5 py-2 rounded-lg text-[11px] font-semibold font-mono uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 active:scale-95'"

new_btn = "'relative px-3 py-1.5 rounded-lg text-[10px] font-semibold font-mono uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1 whitespace-nowrap flex-shrink-0 active:scale-95'"

if old_btn in content:
    content = content.replace(old_btn, new_btn)
    print("Fixed button padding")

with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
