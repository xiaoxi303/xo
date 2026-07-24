# -*- coding: utf-8 -*-
import codecs

# Read backup
with codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue.backup', 'r', 'utf-8') as f:
    content = f.read()

# 1. RefreshSecurityState
old1 = "    clientSession.value = res.clientSession\n    adminSession.value = res.session\n    currentRemainingSec.value = res.clientSession?.remainingSeconds || 0"
new1 = "    clientSession.value = res.clientSession || { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }\n    adminSession.value = res.session || { loggedIn: false, username: '', createdAt: 0, expiresAt: 0, remainingSeconds: 0 }\n    // \u4f18\u5148\u4f7f\u7528\u7528\u6237Token\uff08clientSession\uff09\uff0c\u6ca1\u6709\u7528\u6237\u767b\u5f55\u624d\u4f7f\u7528\u7ba1\u7406\u5458Token\uff08adminSession\uff09\n    if (res.clientSession?.loggedIn) {\n      currentRemainingSec.value = res.clientSession.remainingSeconds || 0\n    } else if (res.session?.loggedIn) {\n      currentRemainingSec.value = res.session.remainingSeconds || 0\n    } else {\n      currentRemainingSec.value = 0\n    }"
assert old1 in content, "Pattern 1 not found!"
content = content.replace(old1, new1)
print("1. Script logic replaced")

# 2. TickCountdown
old2 = "  if (currentRemainingSec.value === 0 && clientSession.value.loggedIn) {"
new2 = "  if (currentRemainingSec.value === 0 && (clientSession.value.loggedIn || adminSession.value.loggedIn)) {"
assert old2 in content, "Pattern 2 not found!"
content = content.replace(old2, new2)
print("2. tickCountdown replaced")

# 3. Template - line by line
lines = content.split('\n')
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if "clientSession.loggedIn" in line and "text-emerald" in line and "mt-1" in line:
        new_lines.append('        <span class="block text-[10px] mt-1" :class="(clientSession.loggedIn || adminSession.loggedIn) ? \'text-emerald-600\' : \'text-rose-500\'">')
        new_lines.append("          {{ clientSession.loggedIn ? `\u7528\u6237 ${clientSession.username} \u5df2\u767b\u5f55` : (adminSession.loggedIn ? `\u7ba1\u7406\u5458 ${adminSession.username} \u5df2\u767b\u5f55` : '\u7528\u6237\u672a\u767b\u5f55\u6216\u5df2\u8fc7\u671f\uff0c\u9700\u8981\u524d\u7aef\u91cd\u65b0\u767b\u5f55') }}")
        new_lines.append("        </span>")
        i += 3
        continue
    new_lines.append(line)
    i += 1

content = '\n'.join(new_lines)
print("3. Template replaced")

# Write with UTF-8
with codecs.open(r'D:\Git\zpj\app\components\AdminSecurityGateway.vue', 'w', 'utf-8') as f:
    f.write(content)

print("File saved successfully!")
