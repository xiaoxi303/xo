# -*- coding: utf-8 -*-
import codecs

files_to_check = [
    r'D:\Git\zpj\app\pages\booking\index.vue',
    r'D:\Git\zpj\app\pages\booking\form.vue',
    r'D:\Git\zpj\app\pages\index.vue',
]

for filepath in files_to_check:
    with codecs.open(filepath, 'r', 'utf-8') as f:
        content = f.read()
    
    # Check for basic template structure
    has_template = '<template>' in content and '</template>' in content
    has_script = '<script' in content
    
    print(f'{filepath.split(chr(92))[-1]}:')
    print(f'  Template: {"OK" if has_template else "MISSING"}')
    print(f'  Script: {"OK" if has_script else "MISSING"}')
    print(f'  Length: {len(content)} chars')
    print()
