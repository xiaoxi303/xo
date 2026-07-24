# -*- coding: utf-8 -*-
import codecs, os

issues = []
server_root = r'D:\Git\zpj\server'

for root, dirs, files in os.walk(server_root):
    if 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with codecs.open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            rel_path = os.path.relpath(filepath, server_root)
            depth = len(rel_path.split(os.sep)) - 1
            
            for line in content.split('\n'):
                if 'import' in line and 'from' in line and 'utils/' in line:
                    parts = line.split('from')
                    if len(parts) > 1:
                        import_path = parts[1].strip().strip("'").strip('"').strip("'")
                        if 'utils/' in import_path:
                            correct_prefix = '../' * depth
                            if not import_path.startswith(correct_prefix):
                                issues.append(f'{rel_path}: {line.strip()}')

if issues:
    print('Import path issues found:')
    for issue in issues:
        print(f'  {issue}')
else:
    print('No import path issues found')
