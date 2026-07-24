# -*- coding: utf-8 -*-
import codecs
import os

# Files to update
files_to_update = [
    r'D:\Git\zpj\server\api\auth\login.post.ts',
    r'D:\Git\zpj\server\api\auth\client-login.post.ts',
    r'D:\Git\zpj\server\api\projects\[slug]\unlock.post.ts',
    r'D:\Git\zpj\server\middleware\admin-guard.ts',
]

for filepath in files_to_update:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - not found")
        continue
    
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()
    
    # Add import if not already present
    if 'getRealClientIP' not in content:
        # Find the last import line
        lines = content.split('\n')
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import'):
                last_import_idx = i
        
        # Add the import after the last import
        import_line = "import { getRealClientIP } from '../../utils/ip-helper'"
        if 'projects' in filepath:
            import_line = "import { getRealClientIP } from '../../../utils/ip-helper'"
        elif 'middleware' in filepath:
            import_line = "import { getRealClientIP } from '../utils/ip-helper'"
        
        lines.insert(last_import_idx + 1, import_line)
        content = '\n'.join(lines)
    
    # Replace getRequestIP calls
    content = content.replace(
        "getRequestIP(event, { xForwardedFor: true }) || 'unknown'",
        "getRealClientIP(event)"
    )
    content = content.replace(
        "getRequestIP(event, { xForwardedFor: true }) || '\u672a\u77e5 IP'",
        "getRealClientIP(event)"
    )
    
    with codecs.open(filepath, 'w', 'utf-8') as f:
        f.write(content)
    
    print(f"Updated: {os.path.basename(filepath)}")

print("\nDone!")
