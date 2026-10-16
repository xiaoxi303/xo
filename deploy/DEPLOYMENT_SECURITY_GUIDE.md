# XO Studio 全站全时段加密与生产环境安全部署手册

> **部署基准**：任何时候要求使用加密传输，任何时候都是加密模式，彻底防御源站 IP 泄露与绕过 CDN 攻击。

---

## 一、传输层全加密与源站 IP 护盾配置 (Nginx)

### 1. 拷贝 Nginx 配置文件
将本项目中准备好的配置文件拷贝至生产服务器：
```bash
# 1. 拷贝 Cloudflare IP 白名单片段
sudo cp deploy/nginx/cloudflare-ips.conf /etc/nginx/snippets/cloudflare-ips.conf

# 2. 拷贝主站点配置
sudo cp deploy/nginx/xo.xoxox.bond.conf /etc/nginx/sites-available/xo.xoxox.bond.conf

# 3. 启用站点配置
sudo ln -sf /etc/nginx/sites-available/xo.xoxox.bond.conf /etc/nginx/sites-enabled/xo.xoxox.bond.conf

# 4. 测试并重载 Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 2. 核心加密与防护特性说明
* **默认黑洞 Server（Catch-All 444）**：
  若任何外部攻击者或全网端口扫描器（如 Shodan、Censys、ZoomEye）直接使用服务器裸 IP（如 `https://161.33.14.226/`）发起探测，Nginx 将直接触发 `return 444;` 掐断 TCP 连接，不发送任何响应头或 SSL 证书，使攻击者无法识别源站身份。
* **Cloudflare 回源白名单与真实 IP 恢复**：
  仅放行 Cloudflare 官方 IPv4/IPv6 节点段，非 CDN 直连流量直接 `deny all` 丢弃；同时通过 `CF-Connecting-IP` 恢复访客真实客户端 IP。
* **现代 TLS 1.2 / TLS 1.3 强加密套件**：
  彻底禁用存在已知漏洞的 TLS 1.0、TLS 1.1 以及 CBC 模式弱加密算法，仅启用具备完美前向安全（PFS）的 ECDHE-RSA/ECDSA + AES-GCM / ChaCha20-Poly1305 顶级加密套件。
* **全站强 HSTS Preload**：
  响应头携带 `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`，强制浏览器一年内仅走加密信道，禁止明文降级。

---

## 二、Linux 内核防火墙防护 (UFW 一键脚本)

在服务器上运行项目自带的防火墙加固脚本：
```bash
sudo bash deploy/scripts/setup-server-firewall.sh
```
**防护效果**：
1. 从 Cloudflare 官方 API 实时拉取最新节点段，在操作系统网络栈底层限制 80/443 端口仅接受 Cloudflare 流量。
2. 公网黑客无法绕过 CDN 对 80/443 发起 TCP 握手。
3. 对 SSH 22 端口启用频率限制（防密码爆破）。

---

## 三、Cloudflare 仪表盘加密优化建议

请登录 Cloudflare 控制台，进入 `xoxox.bond` 域名设置：
1. **SSL/TLS 设置**：
   * **加密模式**：设为 `Full (strict)`（完全严格模式，确保边缘与源站间全程加密）；
   * **Minimum TLS Version**：设为 `TLS 1.2`（解决报告 M3）；
   * **Always Use HTTPS**：开启（强制全站 HTTPS）；
   * **Automatic HTTPS Rewrites**：开启；
   * **TLS 1.3**：开启。
2. **安全性 / WAF**：
   * **Bot Fight Mode**：开启（自动挑战恶意爬虫与扫描器）；
   * **Security Level**：设为 `Medium` 或 `High`。

---

## 四、应用层全链路双舱加密与零豁免验证清单 (Zero-Exemption Matrix)

> **核心原则**：全站任何时候、任何接口、任何文件与代码严禁明文暴露，严禁任何降级通道，执行 100% 零豁免金库共识校验。

| 业务场景 | 加密与安全技术标准 | 强制防御与裁决状态 |
|---|---|---|
| **智能光影人机核验** | 全链路双舱多态混合加密传输 | 强制密文，拦截明文与非授权探测（HTTP 400 + 自动封禁） |
| **图片与媒体文件上传** | 双舱混合加密高熵载荷传输 | 强制密文打包，防嗅探、拦截未加密与非管理员请求 |
| **管理员后台登录** | 量子金库双舱三层交错多态混合加密 | 强制密文，拦截明文与伪造公钥（HTTP 400 + 自动封禁） |
| **客户中心登录** | 全链路双舱多态混合加密传输 | 强制密文，拦截明文（HTTP 400 + 记录失败） |
| **新客户注册归档** | 全链路双舱多态混合加密传输 | 强制密文，拦截明文（HTTP 400 + 密码 PBKDF2-v2） |
| **客户预约提单** | 全链路双舱多态混合加密传输 | 强制密文，拦截明文与高频调用（10分钟限3次） |
| **邮箱验证码发送** | 全链路双舱多态混合加密传输 | 强制密文传输，强制智能人机验证凭据绑定 |
| **作品交付授权解锁** | 全链路双舱多态混合加密传输 | 强制密文，单终端连续 5 次失败自动锁定 15 分钟 |
| **支付通知回调通道** | 专属支付金库官方 RSA2 强共识验签 | 绝非普通免检豁免；严格校验官方 RSA2 签名与数据库金额对齐，伪造回调秒级硬拉黑 |

---

## 五、重点安全漏洞闭环与防御矩阵 (L1 / L4 / L5 / L10 / L17)

| 漏洞编号 | 问题描述 | 根因与修复方案 | 当前防护状态 |
|---|---|---|---|
| **L1** | `sql_dump.txt 仍公开` | 编译后自动彻底清理 `.output/public` 中的 `__nuxt_content` 目录与静态导出；同时在 Nitro 中间件及 Nginx 针对 `sql_dump.txt` 与 `__nuxt_content` 返回 404 并记录黑客封禁。 | **已闭环 (零泄露)** |
| **L4** | `客户登录可区分账号 (密码错误 N/5)` | 消除已存在账号与不存在账号在报错内容、失败计数泄漏及耗时侧信道差异：统一返回 `用户名或密码错误，请重新输入。`，且不存在账号自动执行同等密码 Hash 耗时对齐。 | **已闭环 (防枚举)** |
| **L5** | `源站 SSH (:22) 仍公网开放` | 提供一键加固脚本 `sudo bash deploy/scripts/harden-ssh.sh`，强制启用公钥认证（禁用密码暴力破解）；同时防火墙支持 `ADMIN_SSH_IP=你的公网IP sudo bash deploy/scripts/setup-server-firewall.sh` 仅对特定管理 IP 放行 22 端口。 | **已闭环 (限IP/仅密钥)** |
| **L10** | `apex / 残缺 vhost 仍 502` | 在 `xo.xoxox.bond.conf` 中为 Apex 根域名 (`xoxox.bond` / `www.xoxox.bond`) 增加完整的 HTTP/HTTPS 301 自动跳转至主站；并在部署时自动清理系统残留默认残缺站点 (`rm -f /etc/nginx/sites-enabled/default`)。 | **已闭环 (下线/自动重定向)** |
| **L17** | `滑块是纯客户端行为可伪造凭证` | 彻底移除历史向后兼容的离线未签名凭据 (`XO_SLIDER_`)。所有凭据必须基于服务端签发的 PoW / 空间光影挑战 (`issueSecurityChallenge`)，通过后由服务端在内存票据池签发一次性物理自毁票据 (`XO_VAULT_GATE_`)。任何非服务端生成的公开伪造凭据一律拒绝。 | **已闭环 (全服务端Challenge)** |

---

## 六、自研全栈全面强制加密与零降级体系 (Zero-Downgrade Proprietary Architecture)

系统全面强制执行自研高阶加密防护，杜绝任何明文回退通道：

### 1. 存储层：服务端独立文件量子金库存储 (`$XO_VAULT_FILE_V3$`)
- **加密规格**：AES-256-GCM 独立信封 + HKDF-SHA512 双向派生密钥 + HMAC-SHA512 数字防篡改封签。
- **保护范围**：全量作品 Markdown (`content/projects/*.md`)、站点全套配置 (`content/site-config.json`)、客户与管理员账号库 (`content/users.json`)、授权申请 (`content/password-requests.json`)、在线预约与订单 (`content/bookings.json`, `content/orders.json`, `content/order-pages.json`, `content/delivery-items.json`)、博客与分类 (`content/blog-posts.json`, `content/blog-categories.json`)、黑名单、会话及分析日志等。
- **自动迁移与实时守护**：
  - 服务端启动插件 (`server/plugins/01.auto-init.ts`) 启动时自动扫描并平滑加密全站历史文件；
  - 后台任何保存、编辑、添加作品或配置修改操作，均由 `server/utils/db.ts`、`server/utils/storage.ts` 强制执行 `writeEncryptedFile` / `writeEncryptedJson`，落盘 100% 保持密文封签状态，彻底杜绝明文写入。

```bash
# 检查服务端独立密库状态与关键文件加密清单
npm run vault:status
# 或: node scripts/vault-file-tool.mjs status

# 全面强制加密所有独立文件（自动扫描全量数据并赋予 0600 权限）
npm run vault:encrypt-all
# 或: node scripts/vault-file-tool.mjs encrypt-all

# 校验独立文件数字防篡改封签与完整性
npm run vault:file verify content/site-config.json
```

### 2. 传输层：全链路双舱多态混合加密与反降级网关
- **加密规格**：RSA-4096 一次性公钥池 (OTPK) + AES-256-GCM 双舱混合多态加密载荷 (`$XO_HYBRID_PAYLOAD_V2$`)。
- **反降级网关** (`server/middleware/02.hybrid-decrypt.ts`)：
  - 拦截所有变更类请求 (`POST` / `PUT` / `PATCH` / `DELETE`)；
  - 严格强制校验加密载荷结构 `isRsaHybridPayload(body)`，**任何明文请求直接拒绝 (HTTP 400)，非本地探测 IP 自动触发入侵防御锁死 (Intruder Lockout)**；
  - 前端请求拦截器 (`app/plugins/global-encryption.client.ts`) 全局拦截 `window.fetch`，后台所有操作 (`saveProject`, `saveSiteConfig`, `saveUser` 等) 均自动加密发送。

### 3. 代码层：客户端与服务端生产编译混淆防护
- **加固规格**：`javascript-obfuscator` 高级 AST 混淆、控制流平坦化、字符串数组 RC4/Base64 多重置乱。
- **打包流水线** (`scripts/build-production.mjs`)：`npm run build` 构建完成后自动链式触发生产客户端混淆 (`obfuscate:production`)，保护前端代码资产不被逆向。

---

## 七、全自动一键部署与自愈启动命令 (`deploy/deploy-onekey.sh`)

服务器生产环境只需执行单条一键部署命令，全自动完成依赖同步、全站独立文件强制加密审计、生产打包与混淆、智能端口自愈与高可用集群拉起：

```bash
# 标准一键同步部署与启动（推荐）
bash deploy/deploy-onekey.sh

# 或通过 npm 快捷别名执行
npm run deploy

# 如遇端口或旧进程占用，执行自愈部署
npm run deploy:fix
```

**一键部署全自动流程**：
1. **Node.js 环境自适应探测**：自动识别 NVM、FNM 与系统 PATH，设置 4096MB 内存限制杜绝 OOM。
2. **生产安全环境自检 (.env)**：自动生成/补齐 512 位 `VAULT_MASTER_SECRET`、`SESSION_SECRET`、`XO_PROJECT_PASSWORD_SECRET` 与 `XO_ALIPAY_CONFIG_SECRET`。
3. **全站独立文件强制加密 (Zero-Downgrade)**：自动运行 `node scripts/vault-file-tool.mjs encrypt-all`，全面消除明文，设置 `0700` 密库目录权限与 `0600` 数据文件物理保护。
4. **代码编译与生产混淆**：执行 `npm run build`，完成 Nuxt SSR 静态编译并触发生产 JS 混淆保护。
5. **智能端口分配自愈**：基准端口 `3007`，遭遇冲突自动扫描候选池并无缝重写 `.env`。
6. **服务集群管理与自检**：优先拉起 PM2 集群，执行 OTPK 公钥握手、人机安全核验门与 SSR 主站三联健康探测，输出部署回执。



