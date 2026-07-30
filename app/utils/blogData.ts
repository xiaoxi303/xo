export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  author: {
    name: string
    avatar: string
    role: string
  }
  readTime: string
  coverImage: string
  status: 'Published' | 'Draft'
  createdAt: string
  updatedAt: string
  views: number
  seoTitle?: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string
  count: number
}

const INITIAL_CATEGORIES: BlogCategory[] = [
  { id: '1', name: '全部', slug: 'all', description: '所有精选文章与动态', count: 0 },
  { id: '2', name: 'Design', slug: 'design', description: 'UI/UX 交互设计与胶囊设计系统', count: 0 },
  { id: '3', name: 'Tech', slug: 'tech', description: '前沿前端技术与架构实践', count: 0 },
  { id: '4', name: 'Life', slug: 'life', description: '灵感、读书笔记与剪辑日常', count: 0 }
]

export const useBlogStore = () => {
  const posts = useState<BlogPost[]>('xo-blog-posts-state', () => [])
  const categories = useState<BlogCategory[]>('xo-blog-categories-state', () => INITIAL_CATEGORIES)
  const isLoaded = useState<boolean>('xo-blog-is-loaded', () => false)

  const fetchServerData = async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        $fetch<any>('/api/blog/posts').catch(() => ({ success: false, posts: [] })),
        $fetch<any>('/api/blog/categories').catch(() => ({ success: false, categories: [] }))
      ])

      if (postsRes && postsRes.success && Array.isArray(postsRes.posts)) {
        posts.value = postsRes.posts
      }

      if (catsRes && catsRes.success && Array.isArray(catsRes.categories) && catsRes.categories.length > 0) {
        categories.value = catsRes.categories
      }

      if (process.client && typeof localStorage !== 'undefined') {
        localStorage.setItem('xo_blog_posts', JSON.stringify(posts.value))
        localStorage.setItem('xo_blog_categories', JSON.stringify(categories.value))
      }
      isLoaded.value = true
    } catch (err) {
      console.error('[useBlogStore] Failed to fetch server blog data:', err)
    }
  }

  const init = async () => {
    if (process.client && typeof localStorage !== 'undefined') {
      const storedPosts = localStorage.getItem('xo_blog_posts')
      const storedCats = localStorage.getItem('xo_blog_categories')
      if (storedPosts) {
        try {
          const parsed = JSON.parse(storedPosts)
          if (Array.isArray(parsed)) {
            posts.value = parsed.filter(p => p && !['post-1', 'post-2', 'post-3', 'post-4'].includes(p.id))
          }
        } catch {}
      }
      if (storedCats) {
        try {
          const parsedCats = JSON.parse(storedCats)
          if (Array.isArray(parsedCats) && parsedCats.length > 0) {
            categories.value = parsedCats
          }
        } catch {}
      }
    }

    await fetchServerData()
  }

  const save = () => {
    if (process.client && typeof localStorage !== 'undefined') {
      localStorage.setItem('xo_blog_posts', JSON.stringify(posts.value))
      localStorage.setItem('xo_blog_categories', JSON.stringify(categories.value))
    }
  }

  // Getters
  const getPublishedPosts = () => {
    return posts.value.filter(p => p && p.status === 'Published')
  }

  const getPostBySlug = (slug: string) => {
    return posts.value.find(p => p && (p.slug === slug || p.id === slug))
  }

  const getPostById = (id: string) => {
    return posts.value.find(p => p && p.id === id)
  }

  const getPostsByCategory = (categorySlug: string) => {
    if (!categorySlug || categorySlug === 'all') return getPublishedPosts()
    let decoded = categorySlug
    try { decoded = decodeURIComponent(categorySlug) } catch {}
    const low = decoded.toLowerCase()
    
    const cat = categories.value.find(c => c && (c.slug.toLowerCase() === low || c.name.toLowerCase() === low))
    const catName = cat ? cat.name.toLowerCase() : low
    return getPublishedPosts().filter(p => p && (p.category.toLowerCase() === catName || p.category.toLowerCase() === low))
  }

  // Actions
  const createPost = async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    const newPost: BlogPost = {
      ...post,
      id: 'post-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0
    }
    posts.value.unshift(newPost)
    save()

    try {
      await $fetch('/api/blog/posts', {
        method: 'POST',
        body: { post: newPost }
      })
    } catch (e) {
      console.error('[createPost] Failed to sync to server disk:', e)
    }

    return newPost
  }

  const updatePost = async (id: string, updatedFields: Partial<BlogPost>) => {
    const idx = posts.value.findIndex(p => p && p.id === id)
    if (idx !== -1) {
      posts.value[idx] = {
        ...posts.value[idx],
        ...updatedFields,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      save()

      try {
        await $fetch('/api/blog/posts', {
          method: 'POST',
          body: { post: posts.value[idx] }
        })
      } catch (e) {
        console.error('[updatePost] Failed to sync to server disk:', e)
      }

      return posts.value[idx]
    }
    return null
  }

  const deletePost = async (id: string) => {
    posts.value = posts.value.filter(p => p && p.id !== id)
    save()

    try {
      await $fetch('/api/blog/posts', {
        method: 'DELETE',
        body: { id }
      })
    } catch (e) {
      console.error('[deletePost] Failed to sync deletion to server disk:', e)
    }
  }

  const addCategory = async (name: string, description: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const newCat: BlogCategory = {
      id: 'cat-' + Date.now(),
      name,
      slug,
      description,
      count: 0
    }
    categories.value.push(newCat)
    save()

    try {
      await $fetch('/api/blog/categories', {
        method: 'POST',
        body: { categories: categories.value }
      })
    } catch (e) {
      console.error('[addCategory] Failed to sync categories to server disk:', e)
    }

    return newCat
  }

  const deleteCategory = async (id: string) => {
    categories.value = categories.value.filter(c => c && c.id !== id)
    save()

    try {
      await $fetch('/api/blog/categories', {
        method: 'POST',
        body: { categories: categories.value }
      })
    } catch (e) {
      console.error('[deleteCategory] Failed to sync categories to server disk:', e)
    }
  }

  return {
    posts,
    categories,
    isLoaded,
    init,
    fetchServerData,
    save,
    getPublishedPosts,
    getPostBySlug,
    getPostById,
    getPostsByCategory,
    createPost,
    updatePost,
    deletePost,
    addCategory,
    deleteCategory
  }
}

export const SAMPLE_ARTICLE_MARKDOWN = `# 探索 Modern Serenity：胶囊美学与次世代 Web UI 设计规范

在现代网页视觉设计中，**胶囊风 (Capsule Design)** 凭借其圆润的曲线、优美舒适的视触觉体验以及极强的视觉沉浸感，正在重塑顶尖应用与创意博客的交互形态。

## 核心设计规范 (Design Principles)

1. **浮动胶囊导航 (Floating Pill Bar)**
   - 顶部悬浮的胶囊筛选按钮，选中使用高亮物理天蓝色 \`#007AFF\`，微调暗影与柔光层。
   - 未选中保持微透低饱和底色 \`#F8F8F8\`，无缝契合微暗沉浸背景。

2. **标签与信息胶囊 (Pill Badges)**
   - 文章卡片上标注阅读时间（如 \`5 min read\`）、功能分类（\`Tutorial\`）均采用细腻圆角胶囊包覆。

\`\`\`javascript
// 示例：胶囊高亮状态样式计算
function getCapsuleStyle(isActive) {
  return {
    backgroundColor: isActive ? '#007AFF' : '#F8F8F8',
    color: isActive ? '#FFFFFF' : '#333333',
    borderRadius: '9999px',
    padding: '8px 20px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  }
}
\`\`\`

## 简洁高效的代码块 (Code Block UX)

正文中的代码块采用 \`18px\` 大圆角外框，右上角嵌入轻量级 **Copy Code** 胶囊复制按钮，让代码阅读体验无比自然流畅。

\`\`\`bash
# 极速开启本地测试路由
npm run dev
\`\`\`

> [!TIP]
> 结合柔和渐变背景与微光动画，胶囊界面能为前台读者与后台管理者带来极致的视觉舒适与专注体验。
`
