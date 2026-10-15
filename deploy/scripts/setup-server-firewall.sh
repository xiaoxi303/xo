#!/bin/bash
# ==============================================================================
# XO Studio 服务器底层防火墙加固脚本 (UFW / Iptables)
# 作用：在 Linux 内核网络层阻断任何非 Cloudflare 节点的 80/443 入站流量
# 彻底根绝直接针对源站 IP (161.33.14.226) 的扫描、穿透与 DDoS 攻击
# ==============================================================================

set -e

echo "🔒 开始配置源站防火墙安全策略..."

# 确保以 root 权限执行
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 root 或 sudo 运行此脚本: sudo bash $0"
  exit 1
fi

# 安装 ufw (如尚未安装)
if ! command -v ufw &> /dev/null; then
  apt-get update && apt-get install -y ufw
fi

# 1. 基础策略：默认入站拒绝，出站允许
ufw default deny incoming
ufw default allow outgoing

# 2. SSH 远程管理端口防护 (限 IP 或防暴破限速)
if [ -n "$ADMIN_SSH_IP" ]; then
  echo "🔒 检测到管理员指定 IP ($ADMIN_SSH_IP)，仅允许该 IP 连接 SSH 端口 22..."
  ufw allow from "$ADMIN_SSH_IP" to any port 22 proto tcp comment 'Admin SSH Only'
else
  echo "⚠️ 未指定 ADMIN_SSH_IP，应用公网速率限制防护（建议通过 ADMIN_SSH_IP=你的IP 运行以收敛公网暴露面）..."
  ufw limit 22/tcp comment 'SSH Rate Limited'
fi

# 3. 下载最新的 Cloudflare 官方 IPV4 段并放行 80/443
echo "📥 正在获取 Cloudflare 官方 IPv4 节点列表..."
for cf_ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  ufw allow proto tcp from "$cf_ip" to any port 80,443 comment 'Cloudflare IPv4'
done

# 4. 下载最新的 Cloudflare 官方 IPV6 段并放行 80/443
echo "📥 正在获取 Cloudflare 官方 IPv6 节点列表..."
for cf_ip6 in $(curl -s https://www.cloudflare.com/ips-v6); do
  ufw allow proto tcp from "$cf_ip6" to any port 80,443 comment 'Cloudflare IPv6'
done

# 5. 允许本地回环通信
ufw allow from 127.0.0.1 to 127.0.0.1 comment 'Local loopback'

# 6. 激活防火墙
echo "🚀 激活 UFW 防火墙策略..."
ufw --force enable

echo "✅ 源站防火墙加固完成！所有针对 80/443 的公网直接扫描和攻击现已在内核层直接丢弃。"
ufw status verbose
