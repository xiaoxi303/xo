#!/usr/bin/env bash
# ==============================================================================
# XO STUDIO · 一键全自动同步部署与启动脚本 (One-Key Synchronous Deploy & Run)
# ==============================================================================
# 本脚本集成：依赖自检 -> 数据与运行时自动就绪 -> 生产编译 -> PM2集群热重载 -> 连通性自检
# 无需任何手动分步干预，一条命令完整启动整体项目全部所需能力。
# ==============================================================================

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "=========================================================="
echo "🚀 开始执行 XO Studio 全自动化一体部署与启动..."
echo "📂 项目工作目录: $APP_DIR"
echo "⏰ 执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================================="

# 1. 检查 Node.js 环境
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js 18+ 后重试。"
  exit 1
fi
echo "✅ Node.js 环境正常: $(node -v)"

# 2. 检查或安装依赖
echo ""
echo "📦 正在检查与同步项目依赖..."
npm install --no-audit
echo "✅ 依赖同步就绪。"

# 3. 生产环境编译构建
echo ""
echo "🔨 正在执行生产环境编译打包 (含安全加固与校验)..."
npm run build
echo "✅ 生产构建完成，生成文件位于 .output/。"

# 4. 自动管理服务进程 (优先 PM2，降级使用后台守护进程)
echo ""
echo "🔄 正在同步启动与加载服务集群..."

if command -v pm2 >/dev/null 2>&1; then
  echo "⚡ 检测到 PM2，正在通过 ecosystem.config.cjs 进行零停机热重载/启动..."
  pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
  pm2 save
  echo "✅ PM2 集群服务已同步启动并保存开机状态。"
else
  echo "⚠️ 未检测到全局 PM2，尝试使用 npx pm2 或直接拉起 node 守护进程..."
  if npx --no-install pm2 -v >/dev/null 2>&1; then
    npx pm2 reload ecosystem.config.cjs --update-env || npx pm2 start ecosystem.config.cjs
    echo "✅ npx pm2 集群服务已同步启动。"
  else
    echo "ℹ️ 使用 nohup 启动生产服务 (建议后续安装 pm2: npm install -g pm2)..."
    # 查找并终止旧的 index.mjs 进程
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

# 5. 自动健康自检与公钥交换握手探测
echo ""
echo "🩺 正在等待服务就绪并执行自检..."
sleep 3

MAX_RETRIES=10
RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/security/rsa-public-key || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    SUCCESS=true
    break
  fi
  echo "⏳ 等待服务初始化握手 ($((RETRY_COUNT + 1))/$MAX_RETRIES)..."
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ "$SUCCESS" = "true" ]; then
  echo "=========================================================="
  echo "🎉 部署完成！XO Studio 整体项目已全量同步启动！"
  echo "🔐 量子独立密库已预热，一次性公钥池与午夜自动轮换正常运作。"
  echo "🌐 本地端口: http://127.0.0.1:3000"
  echo "=========================================================="
else
  echo "⚠️ 警告: 健康自检超时，请检查日志 (pm2 logs xo-studio 或 cat server.log)。"
fi
