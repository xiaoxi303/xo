# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Add bookings tab - match exact format with CRLF
old_tabs = "  { label: '\u6388\u6743\u7533\u8bf7', value: 'requests', icon: '\U0001f511' },\r\n  { label: '\u7528\u6237\u7ba1\u7406', value: 'users', icon: '\U0001f465' },"

new_tabs = "  { label: '\u6388\u6743\u7533\u8bf7', value: 'requests', icon: '\U0001f511' },\r\n  { label: '\u5408\u4f5c\u9884\u7ea6', value: 'bookings', icon: '\U0001f4c5' },\r\n  { label: '\u7528\u6237\u7ba1\u7406', value: 'users', icon: '\U0001f465' },"

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    print("Added bookings tab")
else:
    print("Tabs pattern not found")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
