const fs = require('fs');

function parseYaml(yamlStr) {
  const result = {};
  let currentKey = '';
  const lines = yamlStr.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (!line) continue;
    const trimmed = line.trim();
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (trimmed.startsWith('-') && currentKey && !/^-\s*[\w-]+\s*:/.test(trimmed)) {
        const val = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, '');
        if (!Array.isArray(result[currentKey])) { result[currentKey] = []; }
        result[currentKey].push(val);
        continue;
      }
      continue;
    }
    if (trimmed.startsWith('-') && currentKey && !/^-\s*[\w-]+\s*:/.test(trimmed)) {
      const val = trimmed.substring(1).trim().replace(/^['"]|['"]$/g, '');
      if (!Array.isArray(result[currentKey])) { result[currentKey] = []; }
      result[currentKey].push(val);
      continue;
    }
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (val === '') { currentKey = key; result[key] = null; }
      else if (val === 'true') { result[key] = true; }
      else if (val === 'false') { result[key] = false; }
      else { result[key] = val; }
    }
  }
  return result;
}

const filePath = 'content/projects/tk-1231.md';
const content = fs.readFileSync(filePath, 'utf-8');
const firstDash = content.indexOf('---');
const secondDash = content.indexOf('---', firstDash + 3);
const yamlStr = content.substring(firstDash + 3, secondDash);
const meta = parseYaml(yamlStr);
console.log('isPasswordProtected:', meta.isPasswordProtected, typeof meta.isPasswordProtected);
console.log('autoRotatePassword:', meta.autoRotatePassword, typeof meta.autoRotatePassword);
console.log('password:', meta.password);
