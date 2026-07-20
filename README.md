# 🎞️ Xo.dev · 视频剪辑与调色工作室个人主页

Xo.dev 是专为独立视频剪辑指导与 DI 调色总监打造的**轻奢大刊感个人作品集与后台系统**。项目采用最新的 Nuxt 4 规范构建，配有极简的玻璃微光卡片美学，并集成了高水准的管理者认证系统与 Cloudflare D1 数据库存储方案。

---

## 🌟 核心特色与亮点

### 🎨 极致的轻奢纸刊美学 (Quiet Luxury Design)
* **温润材质背景**：使用特制的亚麻暖米色调 (`#f2ede6`) 代替生硬的纯白，辅以四枚柔和晕染的流光 Atmosphere Orbs，营造纸质刊物般的空气感与高级感。
* **暖玻璃卡片 (Warm Glass Card)**：卡片底色改为特调的半透明奶油白，附带暖金渐变边框，重力感应式 3D 微倾斜交互，与背景浑然一体。
* **本地化精雕字体**：全站 100% 离线加载专属字形 `Xo Display`（优雅大刊衬线体）与 `Xo Sans`（现代几何正文体），实现零三方请求的极致流畅性。

### 🔑 真实的管理者安全网关 (Secure Gateway)
* **防撞库保护**：后台登入接口内置 `800ms` 人工阻断延迟，直接免疫黑客的高频脚本穷举破解。
* **高级会话安全**：登录通过 **HttpOnly / Secure / SameSite=Lax** Cookie 鉴权，防御跨站脚本 (XSS) 劫持。
* **写入拦截守卫 (Nitro Guard)**：后台中间件强制防护所有写操作，任何未经登录授权的 `/api/projects` 和 `/api/site-config` 篡改请求都会被返回 `401 Unauthorized`。
* **默认凭证**：
  * **用户名**：`admin`
  * **密码**：`xiaoxi`

### 🗄️ Cloudflare D1 云数据库 + 本地 Fallback 混合架构
* **云端环境 (Cloudflare D1)**：项目部署到 Cloudflare Pages 并检测到 D1 数据库绑定时，自动切换到云端 SQLite 引擎。
* **本地环境 (Local Fallback)**：本地开发时自动无缝降级为**本地 Markdown 物理文件与 JSON 配置文件**存储。一套代码，开发上线两套模式，极佳的开发体验。
* **零配置自动数据库迁移**：系统在检测到 D1 数据库首次连通时，会自动创建表结构并写入种子数据，免除手动导入 SQL 的麻烦。

### 📤 智能本地图片直接上传 (Direct Image Upload & Base64 Fallback)
* **自动双轨路由**：开发了 `/api/upload` 上传网关，支持后台图片一键上传。
  - **本地开发**：自动将图片物理写入 `public/uploads/` 并分发对应的静态链接。
  - **云端环境 (只读文件系统)**：若在 Cloudflare Pages 等只读服务器运行，上传操作会自动无缝降级为**超高保真内联 Base64 编码数据**回填至 D1 数据库中，不需要配置任何额外的第三方图床，开箱即用。

---

## 📁 数据库表结构设计 (D1 SQLite Schema)

### 1. 作品库表 (`projects`)
| 字段名 | 类型 | 描述 |
|---|---|---|
| **slug** | TEXT (PRIMARY KEY) | 作品唯一 ID 标识（如 `tvc-commercial`） |
| **title** | TEXT (NOT NULL) | 作品标题 |
| **image** | TEXT | 封面图片 URL |
| **videoUrl** | TEXT | 原生播放视频 MP4 链接 |
| **software** | TEXT (JSON Array) | 所使用的后期软件列表（如 resolve 等） |
| **tags** | TEXT (JSON Array) | 项目分类标签 |
| **featured** | INTEGER (0 / 1) | 是否设为首页精选置顶 |
| **description** | TEXT | 简短概括 |
| **longDescription** | TEXT | 深度后期技术/设计理念解析 |
| **workflow** | TEXT (JSON Array) | 幕后制作工作流步骤列表 |
| **createdAt** | DATETIME | 录入时间 |

### 2. 站点全局配置表 (`site_config`)
| 字段名 | 类型 | 描述 |
|---|---|---|
| **key** | TEXT (PRIMARY KEY) | 配置键（固定为 `'site_config'`） |
| **value** | TEXT (JSON String) | 包含首页大标题、数据看板指标、关于我经历、社交链接等 JSON 字符串 |

### 3. 页面访问统计表 (`page_views`)
| 字段名 | 类型 | 描述 |
|---|---|---|
| **id** | INTEGER (PRIMARY KEY) | 自增 ID |
| **path** | TEXT (NOT NULL) | 页面访问路径（如 `/`、`/about`、`/projects/slug`） |
| **date** | TEXT (NOT NULL) | 访问日期（格式为 `YYYY-MM-DD`） |
| **count** | INTEGER | 该路径在该日期的累积访问量 (PV) 计数 |
| **UNIQUE** | (path, date) | 联合唯一索引，支持高并发 ON CONFLICT UPSERT 递增 |

### 4. 访客点击事件表 (`analytics_events`)
| 字段名 | 类型 | 描述 |
|---|---|---|
| **id** | INTEGER (PRIMARY KEY) | 自增 ID |
| **event** | TEXT (NOT NULL) | 自定义分析事件名称（如 `project_click`、`contact_click`、`referral`） |
| **meta** | TEXT | 伴随事件的元数据 JSON 字符串（如被点击的作品 ID / Title，或具体外部来源 Referer 链接） |
| **ts** | DATETIME | 事件发生时的时间戳（默认为 `CURRENT_TIMESTAMP`） |

---

## ⚙️ 快速开始

### 1. 安装项目依赖
```bash
npm install
```

### 2. 开启本地开发服务器
本地开发会默认使用文件系统存储（项目根目录下的 `content/projects/*.md` 和 `content/site-config.json`）：
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 预览前台，访问 [/admin](http://localhost:3000/admin) 进行后台配置。

---

## ☁️ 部署到 Cloudflare 并绑定 D1

### 🛠️ 推荐：一键自动绑定 D1（自动化脚本）
项目内置了全自动绑定脚本。只需一步即可自动创建 D1 数据库、检索 UUID 并写入配置文件：
1. **执行一键绑定**：
   - **Windows 用户**：双击运行项目根目录下的 **`bind-d1.bat`**。
   - **命令行用户**：在终端执行以下命令：
     ```bash
     npm run bind-d1
     ```
   *脚本运行成功后，会自动将创建的 D1 `database_id` 注入并覆盖您的 `wrangler.toml` 文件！*

---

### 📝 手动绑定 D1（备用步骤）

1. **手动创建 D1 数据库**：
   在终端执行以下命令：
   ```bash
   npx wrangler d1 create xo-db
   ```
   *运行完毕后，命令行会输出您的 D1 数据库的 database_id。*

2. **配置 bindings 映射**：
   打开根目录下的 `wrangler.toml` 文件，将 database_id 替换为您创建数据库时的真实 ID：
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "xo-db"
   database_id = "您的_DATABASE_ID_写在这里"
   ```

3. **Cloudflare 后台配置与绑定**：
   由于 Cloudflare Pages 限制在 Pages 的 `wrangler.toml` 文件中直接声明 `[build]` 表格，您需要在 **Cloudflare 控制台后台** 录入构建属性与数据库绑定：
   
   - **配置构建参数 (Build Settings)**：
     - 进入您的 Pages 项目控制台，选择 `Settings` -> `Build & deployments` -> `Configure build settings`。
     - **Framework preset (框架预设)**：选择 **`Nuxt.js`**
     - **Build command (构建命令)**：输入 **`npm run build`**
     - **Build output directory (构建输出目录)**：输入 **`.output/public`**
     
   - **绑定 D1 数据库 (D1 Bindings)**：
     - 进入您的 Pages 项目控制台，选择 `Settings` -> `Functions` -> `D1 database bindings`。
     - 点击 **Add binding (添加绑定)**。
     - 将 **Variable name (变量名)** 设为 `DB`，在 **D1 database** 选择下拉框中，选中您创建的 `xo-db` 数据库。

4. **使用 Wrangler 本地调试 D1**：
   如果您想在本地模拟 Cloudflare 容器和本地 D1 进行全仿真运行，可直接运行：
   ```bash
   npx wrangler pages dev
   ```

---

## 📖 核心管理台入口
* 首页地址：👉 [http://localhost:3000](http://localhost:3000)
* 配置后台：👉 [http://localhost:3000/admin](http://localhost:3000/admin) （默认用户名 `admin` 密码 `xiaoxi`）
