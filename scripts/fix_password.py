# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# 1. Add random password generation button next to the password input
old_password_section = '''                    <div class="space-y-1.5">
                      <label class="form-label flex items-center gap-1">
                        <span>\U0001f510 \u8bbf\u95ee\u4fdd\u62a4\u5bc6\u7801</span>
                        <span class="text-[9px] font-normal" style="color: var(--color-ink-5)">(\u7559\u7a7a\u5219\u5b8c\u5168\u516c\u5f00)</span>
                      </label>
                      <input v-model="form.password" type="text" class="form-input font-mono text-xs" placeholder="\u4f8b\u5982: client2026 (\u65e0\u5bc6\u7801\u8bf7\u7559\u7a7a)" />
                    </div>'''

new_password_section = '''                    <div class="space-y-1.5">
                      <label class="form-label flex items-center gap-1">
                        <span>\U0001f510 \u8bbf\u95ee\u4fdd\u62a4\u5bc6\u7801</span>
                        <span class="text-[9px] font-normal" style="color: var(--color-ink-5)">(\u7559\u7a7a\u5219\u5b8c\u5168\u516c\u5f00)</span>
                      </label>
                      <div class="flex gap-2">
                        <input v-model="form.password" type="text" class="form-input font-mono text-xs flex-1" placeholder="\u4f8b\u5982: client2026 (\u65e0\u5bc6\u7801\u8bf7\u7559\u7a7a)" />
                        <button type="button" @click="form.password = generateRandomPassword()" class="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20 whitespace-nowrap">\u968f\u673a\u751f\u6210</button>
                      </div>
                    </div>'''

if old_password_section in content:
    content = content.replace(old_password_section, new_password_section)
    print("1. Password section replaced")
else:
    print("1. Password section not found - trying alternative pattern")
    # Try with different encoding
    old_alt = "                      <input v-model=\"form.password\" type=\"text\" class=\"form-input font-mono text-xs\" placeholder=\"\u4f8b\u5982: client2026 (\u65e0\u5bc6\u7801\u8bf7\u7559\u7a7a)\" />"
    new_alt = "                      <div class=\"flex gap-2\">\n                        <input v-model=\"form.password\" type=\"text\" class=\"form-input font-mono text-xs flex-1\" placeholder=\"\u4f8b\u5982: client2026 (\u65e0\u5bc6\u7801\u8bf7\u7559\u7a7a)\" />\n                        <button type=\"button\" @click=\"form.password = generateRandomPassword()\" class=\"px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20 whitespace-nowrap\">\u968f\u673a\u751f\u6210</button>\n                      </div>"
    if old_alt in content:
        content = content.replace(old_alt, new_alt)
        print("1b. Password input replaced with flex container")
    else:
        print("1c. Could not find password input")

# 2. Add generateRandomPassword function in the script section
# Find where to add the function - before the saveProject function
old_save = "const saveProject = async () => {"
new_function = '''const generateRandomPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const saveProject = async () => {'''

if old_save in content:
    content = content.replace(old_save, new_function)
    print("2. generateRandomPassword function added")
else:
    print("2. saveProject function not found")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved successfully!")
