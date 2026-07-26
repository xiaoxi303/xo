# -*- coding: utf-8 -*-
import codecs

f = codecs.open(r'D:\Git\zpj\server\utils\db.ts', 'r', 'utf-8')
content = f.read()
f.close()

# Fix dbCreateProject - add sortOrder and displayNumber
old_insert = '''      INSERT INTO projects (
        slug, title, image, imageBefore, videoUrl, videoUrls, software, tags, featured, 
        description, longDescription, workflow, password,
        releaseYear, postSpecs, director, deliverFormat, audioFormat
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.slug,
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || normalizeVideoUrls(body)[0] || '',
      JSON.stringify(normalizeVideoUrls(body)),
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || '',
      body.releaseYear || '',
      body.postSpecs || '',
      body.director || '',
      body.deliverFormat || '',
      body.audioFormat || '''''

new_insert = '''      INSERT INTO projects (
        slug, title, image, imageBefore, videoUrl, videoUrls, software, tags, featured, 
        description, longDescription, workflow, password,
        releaseYear, postSpecs, director, deliverFormat, audioFormat,
        sortOrder, displayNumber
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.slug,
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || normalizeVideoUrls(body)[0] || '',
      JSON.stringify(normalizeVideoUrls(body)),
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || '',
      body.releaseYear || '',
      body.postSpecs || '',
      body.director || '',
      body.deliverFormat || '',
      body.audioFormat || '',
      body.sortOrder || 0,
      body.displayNumber || '''''

if old_insert in content:
    content = content.replace(old_insert, new_insert)
    print("Fixed dbCreateProject INSERT")

# Fix dbUpdateProject - add sortOrder and displayNumber
old_update = '''      UPDATE projects
      SET title = ?, image = ?, imageBefore = ?, videoUrl = ?, videoUrls = ?, software = ?, tags = ?, featured = ?, 
          description = ?, longDescription = ?, workflow = ?, password = ?,
          releaseYear = ?, postSpecs = ?, director = ?, deliverFormat = ?, audioFormat = ?
      WHERE slug = ?
    `).bind(
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || normalizeVideoUrls(body)[0] || '',
      JSON.stringify(normalizeVideoUrls(body)),
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || '',
      body.releaseYear || '',
      body.postSpecs || '',
      body.director || '',
      body.deliverFormat || '',
      body.audioFormat || '',
      body.slug'''

new_update = '''      UPDATE projects
      SET title = ?, image = ?, imageBefore = ?, videoUrl = ?, videoUrls = ?, software = ?, tags = ?, featured = ?, 
          description = ?, longDescription = ?, workflow = ?, password = ?,
          releaseYear = ?, postSpecs = ?, director = ?, deliverFormat = ?, audioFormat = ?,
          sortOrder = ?, displayNumber = ?
      WHERE slug = ?
    `).bind(
      body.title,
      body.image || '',
      body.imageBefore || '',
      body.videoUrl || normalizeVideoUrls(body)[0] || '',
      JSON.stringify(normalizeVideoUrls(body)),
      JSON.stringify(body.software || []),
      JSON.stringify(body.tags || []),
      body.featured ? 1 : 0,
      body.description || '',
      body.longDescription || '',
      JSON.stringify(body.workflow || []),
      body.password || '',
      body.releaseYear || '',
      body.postSpecs || '',
      body.director || '',
      body.deliverFormat || '',
      body.audioFormat || '',
      body.sortOrder || 0,
      body.displayNumber || '',
      body.slug'''

if old_update in content:
    content = content.replace(old_update, new_update)
    print("Fixed dbUpdateProject UPDATE")

with codecs.open(r'D:\Git\zpj\server\utils\db.ts', 'w', 'utf-8') as f:
    f.write(content)

print("File saved!")
