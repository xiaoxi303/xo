#!/bin/bash
# ==============================================================================
# XO Studio 服务器 SSH 密钥强认证与公网收敛加固脚本 (Key-Only SSH)
# 作用：禁用密码爆破、禁用空密码、强制 Ed25519/RSA 密钥登录
# ==============================================================================

set -e

if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 root 权限执行: sudo bash $0"
  exit 1
fi

echo "🔒 正在检查当前用户 SSH 公钥配置..."
if [ ! -s "/root/.ssh/authorized_keys" ] && [ ! -s "$HOME/.ssh/authorized_keys" ]; then
  echo "⚠️ 警告: 未在 ~/.ssh/authorized_keys 中检测到已配置的公钥！"
  echo "⚠️ 为防止被锁在服务器外部，请先确保已将您的客户端公钥写入 authorized_keys 后再禁用密码登录。"
  read -p "是否已配置好密钥并确认继续禁用密码登录？(y/N): " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "已取消加固操作。"
    exit 0
  fi
fi

SSHD_CONF_D="/etc/ssh/sshd_config.d"
mkdir -p "$SSHD_CONF_D"

echo "⚙️ 正在应用 SSH 仅密钥安全加固配置..."
cat > "$SSHD_CONF_D/99-xo-security.conf" << 'EOF'
# XO Studio Production SSH Hardening
PasswordAuthentication no
PubkeyAuthentication yes
PermitEmptyPasswords no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
EOF

# 兼容旧版单一 sshd_config
if [ -f "/etc/ssh/sshd_config" ]; then
  sed -i 's/^[# ]*PasswordAuthentication[ ]\+yes/PasswordAuthentication no/' /etc/ssh/sshd_config 2>/dev/null || true
  sed -i 's/^[# ]*PermitEmptyPasswords[ ]\+yes/PermitEmptyPasswords no/' /etc/ssh/sshd_config 2>/dev/null || true
fi

echo "🔄 正在校验 SSH 配置语法..."
if sshd -t; then
  echo "✅ SSH 配置语法检查通过，正在重启 SSH 服务..."
  systemctl reload ssh || systemctl restart ssh || service ssh restart || service sshd restart
  echo "✅ SSH 安全加固完成：公网密码登录已禁用，仅允许公钥认证 (MaxAuthTries=3)。"
else
  echo "❌ SSH 配置语法校验失败，正在还原安全配置..."
  rm -f "$SSHD_CONF_D/99-xo-security.conf"
  exit 1
fi
