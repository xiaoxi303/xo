<div align="center">

# ✨ Xo Studio & Capsule Blog

### 🎬 视频剪辑与调色工作室 · 次世代胶囊博客系统 · E2EE v4.0 顶级量子防御端到端加密

<p>
  <img src="https://img.shields.io/badge/Nuxt-4.5-00DC82?style=for-the-badge&logo=nuxt&logoColor=white" alt="Nuxt 4.5">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3.5">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/E2EE-v4.0_Quantum_Matrix-6366F1?style=for-the-badge&logo=webauthn&logoColor=white" alt="E2EE v4.0">
  <img src="https://img.shields.io/badge/Terser-5--Pass_Obfuscated-FF6B6B?style=for-the-badge&logo=javascript&logoColor=white" alt="Terser Obfuscation">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p>
  <em>专为独立视频剪辑指导、DI 调色总监与创作者打造的轻奢大刊感个人作品集、胶囊风博客、AI 智能摘要、E2EE 零知识量子安全加密与前端防逆向混淆系统</em>
</p>

<p>
  <a href="./FEATURES.md">📖 <strong>全量功能总览文档 (FEATURES.md)</strong></a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-核心特色">核心特色</a> •
  <a href="#-端到端加密-e2ee-v40">E2EE v4.0 量子加密</a> •
  <a href="#-前端混淆与防逆向-v30">前端防逆向混淆</a> •
  <a href="#-🤖-ai-智能总结系统">AI 智能总结</a> •
  <a href="#-部署指南">部署指南</a>
</p>

> 💡 **提示**：项目的详细功能模块拆解、API 接口规格与加密技术指标已整理至独立的全量功能文档中，详情请参阅 [📖 **FEATURES.md**](./FEATURES.md)。

---

<img src="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" alt="Video Editing" width="100%" style="border-radius: 12px; margin: 20px 0;">

</div>

## 🌟 核心特色

<table>
<tr>
<td width="50%">

### 🎬 影视专业交互与 0ms 无感导航

- 🎞️ **调色前后对比滑块** — Log 灰片与 Final 成片实时对比
- 🎵 **氛围音效播放器** — 悬浮音频胶囊与频谱可视化
- 🎥 **技术规格面板** — 4K HDR / ProRes / 后期导演等完整信息
- ⚡ **0ms 极速路由跳转** — 移除了全局 Layout 与页面的同步阻塞，实现 0 毫秒无缝导航

</td>
<td width="50%">

### 🎨 胶囊 UI 美学 & AI 智能总结

- 🤖 **AI 大模型文章总结** — 对接 DeepSeek/OpenAI/Gemini，自动生成 60-100 字精炼概要与打字机动画
- 💊 **悬浮胶囊 Tab 栏** — `#007AFF` 物理天蓝高光，支持动态过滤与隐去
- 📝 **次世代双栏编辑器** — 纯编辑 / ⚖️ 实时双栏对比 / 👁️ 纯预览三模式
- 🖼️ **封面与头像同步** — 拖拽上传与网络 URL 缩放预览，自动联动个人履历头像

</td>
</tr>
<tr>
<td width="50%">

### 🔐 端到端加密 (E2EE v4.0 Quantum Matrix)

- 🔐 **W3C Web Crypto 顶级加密** — PBKDF2 100K 迭代 + HKDF-SHA512 + AES-256-GCM
- 🛡️ **HMAC-SHA512 & Nonce 防篡改** — 包含随机 Epoch Nonce 与零知识证明 Matrix (`ZKP-SHA512`)
- 🔄 **动态密钥热轮换** — 支持在后台控制台中一键热轮换 AES 密钥与会话作废
- 🛡️ **全接口 SESSION 会话锁** — 所有写操作 API 均加入 `validateSession` 强制鉴权

</td>
<td width="50%">

### 🛡️ 前端混淆 & 防审查体系 (v3.0 ULTRA)

- 🌀 **Terser 5-Pass 深度代码混淆** — 多轮 AST 语法树重构，变量与函数名全面单字符哈希化
- 🚫 **Source Map 彻底剥离** — 关停 `.map` 映射与注释，遮蔽 Rollup Chunk 为 16 位 Hash
- 🔒 **全局右键防审查与防复制** — 物理屏蔽右键菜单 (`contextmenu`)、禁止拖拽与文本复制
- ⚡ **Infinite Debugger 卡死陷阱** — 开发者打开 DevTools 调试面板瞬间强行卡死冻结

</td>
</tr>
</table>

---

## 🔐 端到端加密架构 (E2EE v4.0 Quantum Matrix)

基于 W3C 标准 Web Crypto API (`window.crypto.subtle`) 构建的零知识端到端加密系统：

- **PBKDF2 100,000 次迭代与 HKDF-SHA512 密钥派生**：通过 PBKDF2 + SHA-256 进行 100,000 次高阶迭代派生基础密钥，配合 `HKDF-SHA512`（RFC 5869 标准）展开独立的加密与 HMAC 签名子密钥。
- **AES-256-GCM 结合 HMAC-SHA512 双向防篡改**：结合随机 12 字节 IV 向量、Epoch Nonce 与 48 字节 HMAC-SHA512 签名，确保网络传输密文全路径绝对保密且防中途篡改。
- **ZKP-SHA512 零知识证明**：采用 SHA-512 Challenge-Response 零知识证明机制，无需传输任何明文凭证。
- **后台 E2EE 安全沙盒控制台**：在管理后台安全控制台中，集成密钥热轮换、512 位量子指纹展示与加解密实时沙盒测试。

---

## 🛡️ 前端混淆与防逆向系统 (v3.0 ULTRA)

- **Terser 5 轮 AST 混淆 (`passes: 5`)**：启用 `unsafe`、`toplevel` 混淆算法，剥离源代码控制流与全部注释。
- **Source Map 剥离 & 随机 Hash 块**：彻底不生成 `.map` 文件，JS 产物自动重命名为 `_nuxt/[hash:16].js`。
- **物理禁用右键菜单 (`contextmenu`)**：全局拦截右键，彻底屏蔽“检查”、“查看网页源代码”与“另存为”。
- **DevTools Infinite Debugger 陷阱**：高频运行 `Function("debugger")()` 陷阱死循环，一旦开启 DevTools 调试面板将直接被强行挂起卡死。
- **100% 纯净与零后门**：100% 客户端 TypeScript 本地代码，零外部依赖，零数据偷跑。

---

## 🤖 AI 智能总结系统

- **大模型 API 自动对接**：支持在后台【⚙️ 站点配置】中配置 DeepSeek、OpenAI 或 Gemini API Key / Endpoint。
- **60-100 字抽象精炼总结**：采用抽象归纳 Prompt 生成高质量摘要，不机械照抄原句。
- **打字机视觉呈现**：在前台文章详情页自动触发 AI 总结面板，配备打字机逐字展现动画与优雅 Badge 徽章。

---

## ✍️ 胶囊博客系统 (Capsule Blog System)

```
博客前台 (Public Blog)
├── 博客列表页：/blog
├── 分类筛选页：/blog/category/:category
└── 文章详情页：/blog/:slug (SEO 友好 Slug 别名与 AI 总结)

博客后台管理 (Admin Dashboard)
├── 文章管理列表：已整合进 /[adminSuffix] 内部 [✍️ 博客文章] 选项卡
├── 撰写/编辑文章：/[adminSuffix]/posts/new 与 /[adminSuffix]/posts/edit/:id
└── 站点配置与 E2EE：/[adminSuffix] 内部 [🔐 安全控制台] 与 [⚙️ 站点配置]
```

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
# 构建 (触发 Terser 5-Pass 混淆与 Source Map 剥离)
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
| ⚙️ 管理后台 | [localhost:3000/admin](http://localhost:3000/admin) | 作品、博客、分类、E2EE 控制台与全局配置 |

</div>

> **默认密码**：`xiaoxi`（首次登录后请立即修改）

---

## 📁 项目结构

```
xo-studio/
├── app/                    # 前端应用
│   ├── components/         # Vue 组件 (AdminSecurityGateway, CapsuleTag, CapsuleModal 等)
│   ├── layouts/            # 布局文件 (AppNavbar, AppFooter)
│   ├── pages/              # 页面路由 (/blog, /[adminSuffix], /projects)
│   ├── plugins/            # 客户端安全插件 (anti-scrape.client.ts)
│   ├── utils/              # E2EE v4.0 量子加密、前端分析与 blogData 状态库
│   └── assets/             # 静态资源与字体
├── server/                 # 后端服务
│   ├── api/                # API 接口 (projects, analytics, system-status, site-config, password-requests)
│   └── utils/              # 磁盘持久化、密码校验与分析计算引擎
├── content/                # 数据存储（已 gitignore）
│   ├── site-config.json    # 站点配置与 AI 大模型设置
│   ├── project-heat.json   # 热度与统计数据
│   └── projects/           # 视频作品数据
├── nuxt.config.ts          # Nuxt 配置 (包含 Terser 5-Pass 混淆与安全 Headers)
└── package.json            # 项目依赖
```

---

## 🛡️ 数据安全与磁盘持久化

以下数据文件独立保存在服务器磁盘（`content/` 目录），**不会被 git pull 覆写**，支持全网跨设备与浏览器实时同步：

| 文件 / 路径 | 说明 |
|:---|:---|
| `content/blog-posts.json` | 博客文章数据（服务端磁盘持久化，全网共享） |
| `content/blog-categories.json` | 博客分类数据（服务端磁盘持久化，全网共享） |
| `content/site-config.json` | 全局站点与 AI 大模型 API 配置 |
| `content/project-heat.json` | 真实点击热度与页面浏览量 |
| `content/projects/` | 视频作品数据 |
| `localStorage (xo_e2ee_master_key)` | 客户端 AES-256-GCM 独立加密主密钥 |

---

## 📄 开源协议

MIT License © 2026 [Xo Studio](https://github.com/your-username)
