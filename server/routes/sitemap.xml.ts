import { dbGetProjectsRaw, dbGetBlogPosts } from '../utils/db'

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || 'xoxox.bond'
  const protocol = getRequestHeader(event, 'x-forwarded-proto') || 'https'
  const baseUrl = `${protocol}://${host}`

  // Static site routes
  const staticRoutes = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/projects', changefreq: 'daily', priority: '0.9' },
    { loc: '/about', changefreq: 'weekly', priority: '0.8' },
    { loc: '/booking', changefreq: 'weekly', priority: '0.8' },
    { loc: '/blog', changefreq: 'daily', priority: '0.8' }
  ]

  // Dynamic projects
  let projectRoutes: Array<{ loc: string; lastmod?: string; changefreq: string; priority: string }> = []
  try {
    const projects = await dbGetProjectsRaw(event).catch(() => [])
    if (Array.isArray(projects)) {
      projectRoutes = projects
        .filter((p: any) => p && p.slug && !p.isDraft)
        .map((p: any) => ({
          loc: `/projects/${encodeURIComponent(p.slug)}`,
          lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : undefined,
          changefreq: 'weekly',
          priority: '0.8'
        }))
    }
  } catch (err) {
    console.warn('[sitemap] Failed to load dynamic projects:', err)
  }

  // Dynamic blog posts
  let blogRoutes: Array<{ loc: string; lastmod?: string; changefreq: string; priority: string }> = []
  try {
    const posts = await dbGetBlogPosts(event).catch(() => [])
    if (Array.isArray(posts)) {
      blogRoutes = posts
        .filter((p: any) => p && (p.slug || p.id) && p.published !== false)
        .map((p: any) => ({
          loc: `/blog/${encodeURIComponent(p.slug || p.id)}`,
          lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : (p.date || undefined),
          changefreq: 'weekly',
          priority: '0.7'
        }))
    }
  } catch (err) {
    console.warn('[sitemap] Failed to load dynamic blog posts:', err)
  }

  const allUrls = [...staticRoutes, ...projectRoutes, ...blogRoutes]
  const today = new Date().toISOString().split('T')[0]

  const xmlEntries = allUrls.map((item) => {
    const lastmod = item.lastmod || today
    return `  <url>
    <loc>${baseUrl}${item.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  }).join('\n')

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=14400')
  setResponseHeader(event, 'X-Robots-Tag', 'all')

  return sitemapXml
})
