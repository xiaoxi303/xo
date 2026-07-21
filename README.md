# 🎞️ Xo.dev · 视频剪辑与调色工作室个人主页

Xo.dev 是专为独立视频剪辑指导与 DI 调色总监打造的**轻奢大刊感个人作品集与后台系统**。项目采用最新的 Nuxt 4 规范构建，配有极简的玻璃微光卡片美学，支持物理独立服务器存储与持久化数据库模式。

---

## 🌟 核心特色与亮点

### 🎨 极致的轻奢纸刊美学 (Quiet Luxury Design)
* **温润材质背景**：使用特制的亚麻暖米色调 (`#f2ede6`) 代替生硬的纯白，辅以四枚柔和晕染的流光 Atmosphere Orbs，营造纸质刊物般的空气感与高级感。
* **暖玻璃卡片 (Warm Glass Card)**：卡片底色改为特调的半透明奶油白，附带暖金渐变边框，重力感应式 3D 微倾斜交互，与背景浑然一体。
* **本地化精雕字体**：全站 100% 离线加载专属字形 `Xo Display`（优雅大刊衬线体）与 `Xo Sans`（现代几何正文体），实现零三方请求的极致流畅性。

### 🔑 真实的管理者安全网关 (Secure Gateway)
* **防撞库保护**：后台登入接口内置 `800ms` 人工阻断延迟，直接免疫黑客的高频脚本穷举破解。
* **高级会话安全**：登录通过 **HttpOnly / Secure / SameSite=Lax** Cookie 鉴权，防御跨站脚本 (XSS) 劫持。
* **写操作守卫 (Nitro Guard)**：后台中间件强制防护所有写操作，任何未经登录授权的 `/api/projects` 和 `/api/site-config` 篡改请求都会被返回 `401 Unauthorized`。
* **密码保护与安全解密**：作品密码走服务端独占接口比对与 HTTP-only 身份标记，密码绝不暴露给客户端前端。
* **自定义后台路径**：支持在后台安全凭证面板中自定义后台访问后缀 URL。

---

## ⚙️ 服务器部署指南 (Server Deployment)

为了确保您在后台修改的所有作品、密码及全局配置**在重新构建与拉取代码（`git pull`）时绝对不会丢失**，系统已将所有持久化数据解耦隔离。

### 🛠️ 首次/日常更新操作流

服务器打包构建脚本 `npm run build` 已自动内置数据目录判空逻辑。

```bash
# 1. 拉取远端更新
git pull

# 2. 执行构建（会自动检测并补全丢失的基础配置，且绝不会覆写已存在的数据）
npm run build

# 3. PM2 重载进程
pm2 reload xo-portfolio
```

---

## ~~☁️ Cloudflare Pages 部署说明（已作废 / Deprecated）~~

~~由于 Cloudflare Pages / Cloudflare D1 边缘环境与独立物理服务器磁盘读写机制不同，为了保障作品视频与大体积数据持久化安全，项目已全面转向标准 Linux 独立服务器 + Docker / Node.js 生产架构，Cloudflare 部署不再受维护。~~

---

## 📖 核心管理台入口
* 首页地址：👉 [http://localhost:3000](http://localhost:3000)
* 配置后台：👉 [http://localhost:3000/admin](http://localhost:3000/admin) （默认用户名 `admin` 密码 `xiaoxi`）
