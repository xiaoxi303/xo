# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'r', 'utf-8')
content = f.read()
f.close()

# Fix: Add displayNumber to form initialization (handle CRLF)
old_form = "const form = ref<any>({\r\n  slug: '', title: '', image: '', imageBefore: '', videoUrl: '', videoUrls: [''], software: [], tags: [], featured: false, description: '', longDescription: '', workflow: [], password: '',\r\n  releaseYear: '', postSpecs: '', director: '', isGraded: true, deliverFormat: '', audioFormat: ''\r\n})"

new_form = "const form = ref<any>({\r\n  slug: '', title: '', displayNumber: '', image: '', imageBefore: '', videoUrl: '', videoUrls: [''], software: [], tags: [], featured: false, description: '', longDescription: '', workflow: [], password: '',\r\n  releaseYear: '', postSpecs: '', director: '', isGraded: true, deliverFormat: '', audioFormat: ''\r\n})"

if old_form in content:
    content = content.replace(old_form, new_form)
    print("1. Added displayNumber to form initialization")
else:
    print("1. Form initialization not found")

# Write the file
with codecs.open(r'D:\Git\zpj\app\pages\[adminSuffix]\index.vue', 'w', 'utf-8') as f:
    f.write(content)

print("\nFile saved!")
