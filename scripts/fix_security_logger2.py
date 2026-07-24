# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\utils\security-logger.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Fix the require('path') issue - use the already imported path module
old_require = '''    // Ensure directory exists
    const dir = require('path').dirname(LOG_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }'''

new_require = '''    // Ensure directory exists
    const dir = LOG_FILE.substring(0, LOG_FILE.lastIndexOf('\\\\') !== -1 ? LOG_FILE.lastIndexOf('\\\\') : LOG_FILE.lastIndexOf('/'))
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }'''

if old_require in content:
    content = content.replace(old_require, new_require)
    print("Fixed require issue")

# Add path import at the top
old_import = '''import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'
import { broadcastAnalyticsChange } from './broadcaster' '''

new_import = '''import fs from 'node:fs'
import path from 'node:path'
import { getRuntimeDataPath } from './storage'
import { broadcastAnalyticsChange } from './broadcaster' '''

if old_import in content:
    content = content.replace(old_import, new_import)
    print("Added path import")

# Fix to use path.dirname properly
old_dir_logic = '''    // Ensure directory exists
    const dir = LOG_FILE.substring(0, LOG_FILE.lastIndexOf('\\\\') !== -1 ? LOG_FILE.lastIndexOf('\\\\') : LOG_FILE.lastIndexOf('/'))
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }'''

new_dir_logic = '''    // Ensure directory exists
    const dir = path.dirname(LOG_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }'''

if old_dir_logic in content:
    content = content.replace(old_dir_logic, new_dir_logic)
    print("Fixed directory logic")

# Write the file
with codecs.open(r'D:\Git\zpj\server\utils\security-logger.ts', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
