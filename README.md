# 🎞️ Xo.dev · 视频剪辑与调色工作室个人主页

Xo.dev 是专为独立视频剪辑指导与 DI 调色总监打造的**轻奢大刊感个人作品集与后台系统**。项目采用最新的 Nuxt 4 规范构建，配有极简的玻璃微光卡片美学，支持真实独立服务器磁盘存储与完整的后台在线实时管理。

---

## 🌟 核心特色与新增玩法

### 🎬 影视专业特色交互
* **🎞️ 影视调色前后对比滑块 (Interactive LUT Split Slider)**：支持在后台为视频项目上传 `Log 灰片/原片` 与 `Final 调色成片` 镜像画面，前台支持手势与鼠标实时拉条对比。
* **🎵 悬浮律动氛围音效播放器 (Ambient Soundscape Player)**：全站左下角悬浮音频胶囊，内置专业 Soundscape 音乐与动感跳跃柱形频谱。
* **🎥 完整技术规格面板 (Technical Specifications)**：后台全面支持编辑发布年份、后期规格 (如 4K 60FPS HDR)、后期导演、交付格式 (如 ProRes 4444 XQ)、音频编码等。

### 🎨 极致的轻奢纸刊美学 (Quiet Luxury Design)
* **温润材质背景**：使用特制的亚麻暖米色调 (`#f2ede6`) 代替生硬的纯白，辅以四枚柔和晕染的流光 Atmosphere Orbs，营造纸质刊物般的空气感与高级感。
* **暖玻璃卡片 (Warm Glass Card)**：卡片底色改为特调的半透明奶油白，附带暖金渐变边框，重力感应式 3D 微倾斜交互，与背景浑然一体。
* **本地化精雕字体**：全站 100% 离线加载专属字形 `Xo Display`（优雅大刊衬线体）与 `Xo Sans`（现代几何正文体），实现零三方请求的极致流畅性。

### 🔑 真实的管理者安全网关 (Secure Gateway)
* **防撞库保护**：后台登入接口内置 `800ms` 人工阻断延迟，直接免疫黑客的高频脚本穷举破解。
* **高级会话安全**：登录通过 **HttpOnly / Secure / SameSite=Lax** Cookie 鉴权，且会话自动持久化在服务器磁盘 `.sessions.json`，PM2 重载或服务器重启后无需重复登录。
* **写操作守卫 (Nitro Guard)**：后台中间件强制防护所有写操作，任何未经登录授权的 `/api/projects` 和 `/api/site-config` 篡改请求都会被返回 `401 Unauthorized`。
* **服务端独占密码验证**：作品密码走服务端独占接口比对与 HTTP-only 身份标记，密码绝不暴露给客户端前端。
* **自定义后台路径后缀**：支持在后台安全凭证面板中自定义后台访问 URL 后缀（如 `/admin` 修改为 `/my-studio`），修改保存后自动无缝重定向。

---

## ⚙️ 服务器部署与数据持久化机制

为了确保您在后台修改的所有作品、密码、全局配置及安全会话**在重新构建与拉取代码（`git pull`）时绝对不会丢失**，系统已将所有持久化数据解耦隔离并加入 `.gitignore`。

### 🛡️ 数据安全保护说明
以下数据文件独立保存在服务器磁盘，**绝对不会被 git pull 覆写**：
* `content/site-config.json` — 全局站点配置、展示开关、社交链接、后台凭证等
* `content/projects/` — 所有视频作品、Markdown 详情及调色参数
* `content/.sessions.json` — 管理员会话持久化 Token
* `content/page-views.json` — 访问量统计计数

### 🛠️ 代码层面全自动集成数据初始化 (`init-server-data.js`)

数据初始化逻辑已直接写入 `package.json` 的构建与开发生命周期中，无需手动运行初始化脚本：

* **`npm run build`**：打包时会自动优先触发 `node init-server-data.js`，补全确实数据后再执行 `nuxt build`。
* **`npm run dev`**：本地开发启动时也会自动优先运行该逻辑，开箱即用。

> **数据安全保证**：该脚本具备智能判空机制。若检测到服务器缺失基础数据文件则静默创建补齐；若服务器已存在您修改过的配置与作品文件，则**自动跳过（零覆盖风险，绝不会覆写任何既有数据）**。

### 🚀 服务器部署与更新三步命令

```bash
# 1. 拉取远端代码更新
git pull

# 2. 执行构建（自动触发 node init-server-data.js + nuxt build）
npm run build

# 3. 重载 PM2 进程
pm2 reload xo-portfolio
```

---

## ~~☁️ Cloudflare Pages 部署说明（已作废 / Deprecated）~~

~~由于 Cloudflare Pages / Cloudflare D1 边缘环境与独立物理服务器磁盘读写机制不同，为了保障作品视频与大体积数据持久化安全，项目已全面转向标准 Linux 独立服务器 + Docker / Node.js 生产架构，Cloudflare 部署不再受维护。~~

---

## 📖 核心管理台入口
* 首页地址：👉 [http://localhost:3000](http://localhost:3000)
* 配置后台：👉 [http://localhost:3000/admin](http://localhost:3000/admin) （默认用户名在后台任意修改，初始密码 `xiaoxi`）
