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

## 四、应用层端到端加密验证清单

| 业务场景 | 加密技术标准 | 验证状态 |
|---|---|---|
| **管理员登录** | Web Crypto RSA-OAEP-256 + AES-256-GCM + RSA-PSS | 强制密文，拦截明文（HTTP 400） |
| **客户登录** | RSA-OAEP-256 混合加密 / E2EE | 强制密文，拦截明文（HTTP 400） |
| **客户注册** | RSA-OAEP-256 混合加密 / E2EE | 强制密文，拦截明文（HTTP 400） |
| **预约提单** | RSA-OAEP-256 混合加密 | 强制密文，拦截明文（HTTP 400） |
| **邮箱验证码发送** | RSA-OAEP-256 混合加密 | 支持加密载荷，解密投递 |
| **作品授权解锁** | RSA-OAEP-256 混合加密 | 强制密文，连续 5 次失败自动锁定 15 分钟 |
| **订单支付结算** | 服务端签名验签 + 强制金额服务单向决定 | 防篡改，回调强制验签 |
