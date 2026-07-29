<div align="center">

# ✨ Xo Studio & Capsule Blog

### 🎬 视频剪辑与调色工作室 · 次世代胶囊博客系统

<p>
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?style=for-the-badge&logo=nuxt&logoColor=white" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p>
  <em>专为独立视频剪辑指导、DI 调色总监与创作者打造的轻奢大刊感个人作品集、胶囊风博客与后台系统</em>
</p>

<p>
  <a href="#-快速开始">快速开始</a> •
  <a href="#-核心特色">核心特色</a> •
  <a href="#-胶囊博客系统">胶囊博客系统</a> •
  <a href="#-部署指南">部署指南</a> •
  <a href="#-后台管理">后台管理</a>
</p>

---

<img src="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" alt="Video Editing" width="100%" style="border-radius: 12px; margin: 20px 0;">

</div>

## 🌟 核心特色

<table>
<tr>
<td width="50%">

### 🎬 影视专业交互

- 🎞️ **调色前后对比滑块** — Log 灰片与 Final 成片实时对比
- 🎵 **氛围音效播放器** — 悬浮音频胶囊与频谱可视化
- 🎥 **技术规格面板** — 4K HDR / ProRes / 后期导演等完整信息
- ⚡ **全站真实点击热度** — 结合 SSE 广播与磁盘/D1 数据记录，实时统计作品与文章热度

</td>
<td width="50%">

### 🎨 胶囊风 UI 美学 (Pill Architecture)

- 💊 **悬浮胶囊 Tab 栏** — `#007AFF` 物理天蓝高光，支持动态过滤与隐去
- 📝 **次世代双栏编辑器** — 纯编辑 / ⚖️ 实时双栏对比 / 👁️ 纯预览三模式
- 🖼️ **封面 URL 实时预览** — 拖拽上传与网络 URL 链接直观缩放预览
- 🌐 **网络自适应开屏** — 保持光圈 Logo，根据访客真实网速展现影院级舒缓开场

</td>
</tr>
<tr>
<td width="50%">

### 🔑 安全网关

- 🛡️ **防撞库保护** — 800ms 人工阻断延迟
- 🔐 **HttpOnly Cookie** — 安全会话持久化
- 🚪 **自定义后台路径** — 支持自定义 URL 后缀

</td>
<td width="50%">

### 💾 数据持久化

- 📁 **磁盘与 D1 存储** — 作品、配置与博客独立保存
- 🔄 **零覆盖风险** — 纯洁初始状态，全新生成数据绝不被覆写
- 🏷️ **分类与 Banner 自定义** — 前台 Hero Banner 与分类描述支持在后台实时修改

</td>
</tr>
</table>

---

## ✍️ 胶囊博客系统 (Capsule Blog System)

### 📌 RESTful 级 URL 路由规划

```
博客前台 (Public Blog)
├── 博客列表页：/blog
├── 分类筛选页：/blog/category/:category
└── 文章详情页：/blog/:slug (SEO 友好 Slug 别名)

博客后台管理 (Admin Dashboard)
├── 文章管理列表：已整合进 /admin 内部 [✍️ 博客文章] 选项卡
├── 撰写/编辑文章：/admin/posts/new 与 /admin/posts/edit/:id
└── 分类与 Banner 配置：/admin 内部展开面板与 [⚙️ 站点配置]
```

### 🎨 Modern Serenity 胶囊 UI 设计规范

- **胶囊 Tab 动态过滤**：选中态为天空蓝 `#007AFF` 胶囊，未选中为 `#F8F8F8`，根据实际【已发布文章】实时计算分类数量。无文章的分类自动隐藏，保持界面纯粹干净。
- **居中搜索框与动态热搜**：具备放大镜 Icon 徽章、`⌘ K` 快捷键与一键清空；热门标签根据已发布文章真实使用频次动态生成。
- **高级文章排版**：16-24px 大圆角代码块、右上角“复制代码”胶囊按键、作者 Pill 徽章与柔和微光 Glow。
- **极简写作编辑器**：三模式（纯编辑 / ⚖️ 双栏对比 / 👁️ 纯预览）无缝切换、悬浮格式化工具栏、文章字数与预计阅读时间实时计算。

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0
- npm >= 9.0

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-username/xo-studio.git
cd xo-studio

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果 ✨

---

## 📦 构建与部署

### 生产环境构建

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

### 服务器部署

```bash
# 1. 拉取更新
git pull

# 2. 构建项目
npm run build

# 3. 重载 PM2
pm2 reload xo-portfolio
```

---

## 🎯 后台管理

<div align="center">

| 入口 | 地址 | 说明 |
|:---:|:---:|:---:|
| 🏠 首页 | [localhost:3000](http://localhost:3000) | 作品集与最新博客展示 |
| 📖 博客前台 | [localhost:3000/blog](http://localhost:3000/blog) | 博客文章列表与分类检索 |
| ⚙️ 管理后台 | [localhost:3000/admin](http://localhost:3000/admin) | 作品、博客、分类与站点全局控制台 |

</div>

> **默认密码**：`xiaoxi`（首次登录后请立即修改）

---

## 📁 项目结构

```
xo-studio/
├── app/                    # 前端应用
│   ├── components/         # Vue 组件 (CapsuleTag, CapsuleModal, CapsuleToolbar 等)
│   ├── layouts/            # 布局文件
│   ├── pages/              # 页面路由 (/blog, /admin, /projects)
│   ├── utils/              # 前端分析工具与 blogData 状态库
│   └── assets/             # 静态资源与字体
├── server/                 # 后端服务
│   ├── api/                # API 接口 (projects, analytics, system-status, site-config)
│   └── utils/              # 磁盘持久化与分析计算引擎
├── content/                # 数据存储（已 gitignore）
│   ├── site-config.json    # 站点配置
│   ├── project-heat.json   # 热度与统计数据
│   └── projects/           # 视频作品数据
├── nuxt.config.ts          # Nuxt 配置
└── package.json            # 项目依赖
```

---

## 🛡️ 数据安全与持久化

以下数据文件独立保存在服务器磁盘，**不会被 git pull 覆写**：

| 文件 / 路径 | 说明 |
|:---|:---|
| `content/site-config.json` | 全局站点与博客 Banner 配置 |
| `content/project-heat.json` | 真实点击热度与页面浏览量 |
| `content/projects/` | 视频作品数据 |
| `localStorage (xo_blog_posts)` | 博客文章与分类数据存储 |

---

## 🎨 设计系统

<div align="center">

| 颜色 | 色值 | 用途 |
|:---:|:---:|:---:|
| ![#007AFF](https://via.placeholder.com/20/007AFF/007AFF) | `#007AFF` | 物理天蓝 (Primary Accent) |
| ![#F8F8F8](https://via.placeholder.com/20/F8F8F8/F8F8F8) | `#F8F8F8` | 未选中胶囊底色 |
| ![#34C759](https://via.placeholder.com/20/34C759/34C759) | `#34C759` | 已发布绿胶囊 (Published) |
| ![#FFCC00](https://via.placeholder.com/20/FFCC00/FFCC00) | `#FFCC00` | 草稿黄胶囊 (Draft) |

</div>

---

## 📄 开源协议

MIT License © 2026 [Xo Studio](https://github.com/your-username)
