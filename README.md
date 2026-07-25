<div align="center">

# ✨ Xo Studio

### 🎬 视频剪辑与调色工作室

<p>
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?style=for-the-badge&logo=nuxt&logoColor=white" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
</p>

<p>
  <em>专为独立视频剪辑指导与 DI 调色总监打造的轻奢大刊感个人作品集与后台系统</em>
</p>

<p>
  <a href="#-快速开始">快速开始</a> •
  <a href="#-核心特色">核心特色</a> •
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

</td>
<td width="50%">

### 🎨 轻奢纸刊美学

- 🌿 **温润材质背景** — 亚麻暖米色调，纸质刊物般质感
- ✨ **暖玻璃卡片** — 半透明奶油白，3D 微倾斜交互
- 🔤 **专属定制字体** — Xo Display & Xo Sans，零外部请求

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

- 📁 **磁盘存储** — 作品与配置独立保存
- 🔄 **智能初始化** — 构建时自动补全缺失数据
- ⚡ **零覆盖风险** — 已有数据绝不被覆写

</td>
</tr>
</table>

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
# 构建（自动触发数据初始化）
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
| 🏠 首页 | [localhost:3000](http://localhost:3000) | 作品集展示 |
| ⚙️ 后台 | [localhost:3000/admin](http://localhost:3000/admin) | 管理控制台 |

</div>

> **默认密码**：`xiaoxi`（首次登录后请立即修改）

---

## 📁 项目结构

```
xo-studio/
├── app/                    # 前端应用
│   ├── components/         # Vue 组件
│   ├── layouts/            # 布局文件
│   ├── pages/              # 页面路由
│   └── assets/             # 静态资源
├── server/                 # 后端服务
│   ├── api/                # API 接口
│   └── utils/              # 工具函数
├── content/                # 数据存储（已 gitignore）
│   ├── site-config.json    # 站点配置
│   └── projects/           # 作品数据
├── public/                 # 公共静态文件
├── nuxt.config.ts          # Nuxt 配置
└── package.json            # 项目依赖
```

---

## 🛡️ 数据安全

以下数据文件独立保存在服务器磁盘，**不会被 git pull 覆写**：

| 文件 | 说明 |
|:---|:---|
| `content/site-config.json` | 全局站点配置 |
| `content/projects/` | 视频作品数据 |
| `content/.sessions.json` | 管理员会话 |
| `content/page-views.json` | 访问量统计 |

---

## 🎨 设计系统

<div align="center">

| 颜色 | 色值 | 用途 |
|:---:|:---:|:---:|
| ![#f2ede6](https://via.placeholder.com/20/f2ede6/f2ede6) | `#f2ede6` | 主背景 |
| ![#b45309](https://via.placeholder.com/20/b45309/b45309) | `#b45309` | 品牌色 |
| ![#0f1014](https://via.placeholder.com/20/0f1014/0f1014) | `#0f1014` | 主文字 |

</div>

---

## 📄 开源协议

MIT License © 2024 [Xo Studio](https://github.com/your-username)

---

<div align="center">

### 🌟 如果这个项目对你有帮助，请给一个 Star ⭐

<p>
  <a href="https://github.com/your-username/xo-studio/stargazers">
    <img src="https://img.shields.io/github/stars/your-username/xo-studio?style=social" alt="Stars">
  </a>
  <a href="https://github.com/your-username/xo-studio/fork">
    <img src="https://img.shields.io/github/forks/your-username/xo-studio?style=social" alt="Forks">
  </a>
</p>

</div>
