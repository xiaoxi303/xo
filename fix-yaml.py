# -*- coding: utf-8 -*-
import re

with open(r'server/utils/db.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the parseYaml function
# We need to add block scalar support

# First, find the start of parseYaml function
start_marker = 'function parseYaml(yamlStr: string): any {'
end_marker = '  return result\n}'

start_idx = content.find(start_marker)
if start_idx == -1:
    print('Could not find parseYaml function start')
    exit(1)

# Find the end of the function by counting braces
brace_count = 0
end_idx = start_idx
for i in range(start_idx, len(content)):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end_idx = i + 1
            break

old_function = content[start_idx:end_idx]
print(f'Found parseYaml function ({len(old_function)} chars)')

# New function with block scalar support
new_function = '''function parseYaml(yamlStr: string): any {
  const result: any = {}
  let currentKey = ''
  let inBlockScalar = false
  let blockScalarIndent = 0
  let blockScalarLines: string[] = []
  const lines = yamlStr.split('\\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Handle block scalar continuation
    if (inBlockScalar) {
      if (!trimmed) {
        blockScalarLines.push('')
        continue
      }
      const currentIndent = line.search(/\\S/)
      if (blockScalarIndent === 0) {
        blockScalarIndent = currentIndent
      }
      if (currentIndent >= blockScalarIndent) {
        blockScalarLines.push(line.substring(blockScalarIndent))
        continue
      } else {
        // Block scalar ended, save it
        result[currentKey] = blockScalarLines.join('\\n').trimEnd()
        inBlockScalar = false
        blockScalarLines = []
        blockScalarIndent = 0
        // Fall through to process this line normally
      }
    }
    
    if (!trimmed) continue

    if (line.startsWith(' ') || line.startsWith('\\t')) {
      if (trimmed.startsWith('-') && currentKey && !/^-\\s*[\\w-]+\\s*:/.test(trimmed)) {
        const val = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, '')
        if (!Array.isArray(result[currentKey])) {
          result[currentKey] = []
        }
        result[currentKey].push(val)
        continue
      }
      // Skip nested fields (like title, desc inside workflow) to prevent overwriting root keys
      continue
    }

    if (trimmed.startsWith('-') && currentKey && !/^-\\s*[\\w-]+\\s*:/.test(trimmed)) {
      const val = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, '')
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = []
      }
      result[currentKey].push(val)
      continue
    }

    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim()
      const val = line.substring(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '')

      // Check for block scalar indicators
      if (val === '|-' || val === '|' || val === '>-' || val === '>') {
        currentKey = key
        inBlockScalar = true
        blockScalarIndent = 0
        blockScalarLines = []
        continue
      }
      
      if (val === '') {
        currentKey = key
        result[key] = null
      } else if (val === 'true') {
        result[key] = true
      } else if (val === 'false') {
        result[key] = false
      } else {
        result[key] = val
      }
    }
  }
  
  // Save any remaining block scalar
  if (inBlockScalar && currentKey) {
    result[currentKey] = blockScalarLines.join('\\n').trimEnd()
  }

  const workflowMatch = yamlStr.match(/workflow:\\s*([\\s\\S]*?)(?=\\n\\w+:|$)/)
  if (workflowMatch) {
    const items = []
    const itemBlocks = workflowMatch[1].split(/\\n\\s*-\\s+/g)
    for (let block of itemBlocks) {
      block = block.trim()
      if (!block) continue
      const item: any = {}
      const lines = block.split('\\n')
      for (const line of lines) {
        const cIdx = line.indexOf(':')
        if (cIdx !== -1) {
          const k = line.substring(0, cIdx).trim()
          const v = line.substring(cIdx + 1).trim().replace(/^['"]|['"]$/g, '')
          item[k] = v
        }
      }
      if (item.title || item.desc) {
        items.push(item)
      }
    }
    result.workflow = items
  }

  return result
}'''

content = content.replace(old_function, new_function)

with open(r'server/utils/db.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('YAML parser fixed to support block scalars')
