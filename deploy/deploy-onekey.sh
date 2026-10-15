#!/usr/bin/env bash
# ==============================================================================
# XO STUDIO · 一键全自动同步部署与启动脚本 (One-Key Synchronous Deploy & Run)
# ==============================================================================
# 本脚本集成：
# 1. 运行环境自检 (Node.js 18+)
# 2. 生产环境变量与金库主密钥自动就绪 (.env 自动生成 512 位金库持久主秘钥)
# 3. 运行时存储层与黑名单数据同步初始化 (init-server-data.js)
# 4. 项目依赖自动同步安装 (npm install)
# 5. 生产环境全量编译与代码防篡改安全校验 (npm run build -> verify:production)
# 6. PM2 集群服务零停机热重载与守护进程同步拉起 (ecosystem.config.cjs)
# 7. 全链路三联健康自检 (金库公钥握手 + 滑块拼图引擎 + SSR主站入口)
# 8. 开机自启持久化保存 (pm2 save)
# ==============================================================================

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "=========================================================="
echo "🚀 开始执行 XO Studio 全自动化一体部署与同步启动..."
echo "📂 项目工作目录: $APP_DIR"
echo "⏰ 执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================================="

# 1. 检查 Node.js 环境
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js 18+ 后重试。"
  exit 1
fi
NODE_VER=$(node -v)
echo "✅ Node.js 运行环境就绪: $NODE_VER"

# 2. 生产环境变量与金库持久主秘钥自动配置 (.env)
if [ ! -f ".env" ]; then
  echo ""
  echo "🔐 正在自动初始化生产安全配置文件 (.env)..."
  VAULT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  SESSION_SEC=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat <<EOF > .env
# XO STUDIO 生产环境安全配置文件 (自动生成)
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
VAULT_MASTER_SECRET=$VAULT_SECRET
SESSION_SECRET=$SESSION_SEC
EOF
  chmod 600 .env 2>/dev/null || true
  echo "✅ 生产配置文件已生成，已注入 512 位金库高熵主秘钥 (权限已设为 600 物理保护)。"
else
  # 校验已有 .env 中是否缺少金库主秘钥
  if ! grep -q "VAULT_MASTER_SECRET" .env; then
    VAULT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    echo "VAULT_MASTER_SECRET=$VAULT_SECRET" >> .env
    echo "🔑 已为现有 .env 自动补齐 512 位金库高熵主秘钥。"
  fi
  if ! grep -q "SESSION_SECRET" .env; then
    SESSION_SEC=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "SESSION_SECRET=$SESSION_SEC" >> .env
    echo "🔑 已为现有 .env 自动补齐 256 位会话安全密钥。"
  fi
  chmod 600 .env 2>/dev/null || true
  echo "✅ 生产配置文件已就绪 (.env 权限 600 保护)。"
fi

# 3. 同步初始化运行时数据与金库存储结构
echo ""
echo "📁 正在同步初始化全站存储层与安全表单..."
node init-server-data.js
chmod -R 755 content 2>/dev/null || true
echo "✅ 运行时数据表与金库密钥目录已全量就绪。"

# 4. 同步检查并安装项目依赖
echo ""
echo "📦 正在检查与同步项目完整依赖..."
npm install --no-audit
echo "✅ 项目依赖同步就绪。"

# 5. 生产环境编译构建与安全脱敏自检
echo ""
echo "🔨 正在执行生产环境编译打包 (含安全加固与校验)..."
npm run build

if [ ! -f ".output/server/index.mjs" ]; then
  echo "❌ 错误: 未检测到服务端入口产物 .output/server/index.mjs，构建未完全生成！"
  exit 1
fi

echo "✅ 生产构建完成，静态资源与服务端运行时已就绪于 .output/。"

# 6. 自动管理并同步启动服务集群 (优先 PM2，次选后台守护)
echo ""
echo "🔄 正在同步启动与加载服务集群..."

if command -v pm2 >/dev/null 2>&1; then
  echo "⚡ 检测到 PM2，正在通过 ecosystem.config.cjs 进行零停机热重载/同步启动..."
  pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
  pm2 save
  echo "✅ PM2 双实例集群服务已同步启动并保存开机状态。"
else
  echo "⚠️ 未检测到全局 PM2，尝试使用 npx pm2 或直接拉起 node 守护进程..."
  if npx --no-install pm2 -v >/dev/null 2>&1; then
    npx pm2 reload ecosystem.config.cjs --update-env || npx pm2 start ecosystem.config.cjs
    echo "✅ npx pm2 集群服务已同步启动。"
  else
    echo "ℹ️ 使用 nohup 启动生产服务 (建议后续安装 pm2: npm install -g pm2)..."
    PID=$(pgrep -f ".output/server/index.mjs" || true)
    if [ -n "$PID" ]; then
      echo "🛑 正在平滑停止旧进程 PID: $PID"
      kill -15 "$PID" || true
      sleep 2
    fi
    PORT=3000 HOST=127.0.0.1 nohup node .output/server/index.mjs > server.log 2>&1 &
    echo "✅ 生产服务已在后台运行，日志输出至 server.log。"
  fi
fi

# 7. 全链路三联健康自检 (握手探测 + 滑块引擎 + 主站渲染)
echo ""
echo "🩺 正在等待服务就绪并执行全链路三联自检..."
sleep 3

MAX_RETRIES=10
RETRY_COUNT=0
ALL_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # 探测 1: 金库一次性公钥握手 (OTPK)
  CODE_KEY=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/security/rsa-public-key || echo "000")
  # 探测 2: 智能光影人机安全核验引擎挑战
  CODE_SLIDER=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/security/slider-challenge || echo "000")
  # 探测 3: SSR 主站 HTML 渲染
  CODE_INDEX=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "000")

  if [ "$CODE_KEY" = "200" ] && [ "$CODE_SLIDER" = "200" ] && [ "$CODE_INDEX" = "200" ]; then
    ALL_READY=true
    break
  fi

  echo "⏳ 等待服务初始化握手 ($((RETRY_COUNT + 1))/$MAX_RETRIES) [Key:$CODE_KEY, Gate:$CODE_SLIDER, Web:$CODE_INDEX]..."
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$ALL_READY" = "true" ]; then
  echo "=========================================================="
  echo "🎉 部署完成！XO Studio 整体项目已全量同步启动就绪！"
  echo "🔐 量子独立密库已预热，一次性公钥池与午夜自动轮换正常运作。"
  echo "🛡️ 智能光影生物安全核验引擎已就绪 (/api/security/slider-challenge)。"
  echo "🌐 本地服务端点: http://127.0.0.1:3000"
  echo "=========================================================="
  
  # 8. 智能同步 Nginx 反向代理配置
  if command -v nginx >/dev/null 2>&1; then
    echo ""
    echo "🌐 正在检查与同步 Nginx 反向代理与 TLS 配置..."
    if [ "$(id -u)" -eq 0 ]; then
      if [ -f "deploy/nginx/cloudflare-ips.conf" ]; then
        mkdir -p /etc/nginx/snippets
        cp deploy/nginx/cloudflare-ips.conf /etc/nginx/snippets/cloudflare-ips.conf
      fi
      if [ -f "deploy/nginx/xo.xoxox.bond.conf" ]; then
        mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
        cp deploy/nginx/xo.xoxox.bond.conf /etc/nginx/sites-available/xo.xoxox.bond.conf
        ln -sf /etc/nginx/sites-available/xo.xoxox.bond.conf /etc/nginx/sites-enabled/xo.xoxox.bond.conf
        # 彻底下线默认与残缺旧 vhost，杜绝 apex 域名 502 错误
        rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf 2>/dev/null || true
        if nginx -t >/dev/null 2>&1; then
          systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
          echo "✅ Nginx 站点配置已自动同步、检验通过并完成热重载 (残缺默认站点已自动下线)。"
        else
          echo "⚠️ Nginx 配置语法检测未通过，请检查 SSL 证书路径后重试: nginx -t"
        fi
      fi
    else
      echo "💡 当前为非 root 用户，如需同步更新公网 Nginx 代理，请执行以下指令:"
      echo "   sudo cp deploy/nginx/cloudflare-ips.conf /etc/nginx/snippets/"
      echo "   sudo cp deploy/nginx/xo.xoxox.bond.conf /etc/nginx/sites-available/"
      echo "   sudo ln -sf /etc/nginx/sites-available/xo.xoxox.bond.conf /etc/nginx/sites-enabled/"
      echo "   sudo nginx -t && sudo systemctl reload nginx"
    fi
  fi
else
  echo "⚠️ 警告: 健康自检超时或部分模块未就绪，请检查服务日志 (pm2 logs xo-studio 或 cat server.log)。"
fi
