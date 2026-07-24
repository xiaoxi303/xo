# -*- coding: utf-8 -*-
import codecs, os

server_root = r'D:\Git\zpj\server'

print("=== All files importing from utils ===\n")

for root, dirs, files in os.walk(server_root):
    if 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with codecs.open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            rel_path = os.path.relpath(filepath, server_root)
            has_utils_import = False
            
            for line in content.split('\n'):
                if 'import' in line and 'from' in line and 'utils/' in line:
                    has_utils_import = True
                    print(f'{rel_path}:')
                    print(f'  {line.strip()}')
            
            if has_utils_import:
                print()
