# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# The exact line from the file (with CRLF and exact spaces)
old_input = '                     <input v-model="form.password" type="text" class="form-input font-mono text-xs" placeholder="\u4f8b\u5982: client2026 (\u65e0\u5bc6\u7801\u8bf7\u7559\u7a7a)" />\r'

new_input = '''                     <div class="flex gap-2">\r
                       <input v-model="form.password" type="text" class="form-input font-mono text-xs flex-1" placeholder="\u4f8b\u5982: client2026 (\u65e0\u5bc6\u7801\u8bf7\u7559\u7a7a)" />\r
                       <button type="button" @click="form.password = generateRandomPassword()" class="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20 whitespace-nowrap">\u968f\u673a\u751f\u6210</button>\r
                     </div>\r'''

if old_input in content:
    content = content.replace(old_input, new_input)
    print("1. Password input replaced with flex container + random button")
else:
    print("1. Password input not found")
    # Debug: show the exact line
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'form.password' in line and 'input' in line:
            print(f"  Found at line {i+1}: {repr(line)}")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
