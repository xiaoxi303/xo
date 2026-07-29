import re

with open(r'app/pages/projects/index.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: transition-all -> transition-transform (reduce repaint scope)
content = content.replace(
    'class="group shadow-2xl transition-all duration-500"',
    'class="group shadow-2xl transition-transform duration-300"'
)

# Change 2: Optimize transition delay  
content = content.replace(
    ':style="{ transitionDelay: `${i * 45}ms` }"',
    ':style="{ transitionDelay: `${Math.min(i * 30, 200)}ms` }"'
)

# Change 3: Reduce image hover duration
content = content.replace(
    'transition-transform duration-700 group-hover:scale-105',
    'transition-transform duration-500 group-hover:scale-105'
)

# Change 4: Reduce SVG icon transition
content = content.replace(
    'transition-transform duration-300 group-hover:scale-110',
    'transition-transform duration-200 group-hover:scale-110'
)

with open(r'app/pages/projects/index.vue', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Done - all changes applied successfully')
