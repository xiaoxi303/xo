# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Add bookings tab to tabs array
old_tabs = '''const tabs = [
{ label: '\u6570\u636e\u770b\u677f', value: 'analytics', icon: '\U0001f4ca' },
{ label: '\u4f5c\u54c1\u7ba1\u7406', value: 'projects', icon: '\U0001f3ac' },
{ label: '\u6388\u6743\u7533\u8bf7', value: 'requests', icon: '\U0001f511' },
{ label: '\u7528\u6237\u7ba1\u7406', value: 'users', icon: '\U0001f465' },
{ label: '\u9996\u9875\u914d\u7f6e', value: 'home', icon: '\U0001f3e0' },
{ label: '\u4e2a\u4eba\u5c65\u5386', value: 'about', icon: '\U0001f64b' },
{ label: '\u7ad9\u70b9\u4fe1\u606f', value: 'siteinfo', icon: '\U0001f310' },
{ label: '\u9ad8\u7ea7\u8bbe\u7f6e', value: 'advanced', icon: '\U0001f3a8' }
]'''

new_tabs = '''const tabs = [
{ label: '\u6570\u636e\u770b\u677f', value: 'analytics', icon: '\U0001f4ca' },
{ label: '\u4f5c\u54c1\u7ba1\u7406', value: 'projects', icon: '\U0001f3ac' },
{ label: '\u6388\u6743\u7533\u8bf7', value: 'requests', icon: '\U0001f511' },
{ label: '\u5408\u4f5c\u9884\u7ea6', value: 'bookings', icon: '\U0001f4c5' },
{ label: '\u7528\u6237\u7ba1\u7406', value: 'users', icon: '\U0001f465' },
{ label: '\u9996\u9875\u914d\u7f6e', value: 'home', icon: '\U0001f3e0' },
{ label: '\u4e2a\u4eba\u5c65\u5386', value: 'about', icon: '\U0001f64b' },
{ label: '\u7ad9\u70b9\u4fe1\u606f', value: 'siteinfo', icon: '\U0001f310' },
{ label: '\u9ad8\u7ea7\u8bbe\u7f6e', value: 'advanced', icon: '\U0001f3a8' }
]'''

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    print("Added bookings tab")
else:
    print("Tabs pattern not found")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
