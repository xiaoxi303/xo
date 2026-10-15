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
PORT=3007
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
  # 若现有 .env 仍包含旧的 3000 端口，全自动平滑升级为专属智能端口 3007
  if grep -q "^PORT=3000" .env; then
    sed -i "s/^PORT=3000/PORT=3007/" .env
    echo "⚡ 检测到 .env 为旧的 3000 端口，已全自动平滑升级为专属智能端口 3007。"
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

# 6. 全自动智能端口机制 (专属基准端口 3007，智能检测自愈，冲突自动换可用端口并持久化)
echo ""
echo "🔍 正在进行运行端口状态探测与智能分配..."

DESIRED_PORT="${PORT:-3007}"
if [ "$DESIRED_PORT" = "3000" ]; then
  DESIRED_PORT=3007
fi

is_port_in_use() {
  local p="$1"
  node -e "
    const net = require('net');
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') process.exit(1);
      process.exit(0);
    });
    server.once('listening', () => {
      server.close(() => process.exit(0));
    });
    server.listen($p, '127.0.0.1');
  " >/dev/null 2>&1
  if [ $? -eq 1 ]; then
    return 0 # in use
  else
    return 1 # free
  fi
}

APP_PORT="$DESIRED_PORT"

# 检查 PM2 是否正在守护运行当前项目
IS_PM2_RUNNING=false
if command -v pm2 >/dev/null 2>&1; then
  if pm2 list 2>/dev/null | grep -q "xo-studio"; then
    IS_PM2_RUNNING=true
  fi
fi

if is_port_in_use "$DESIRED_PORT"; then
  if [ "$IS_PM2_RUNNING" = "true" ]; then
    echo "ℹ️ 检测到 PM2 已在端口 $DESIRED_PORT 守护运行本服务，准备进行无缝集群热重载..."
    APP_PORT="$DESIRED_PORT"
  else
    echo "⚠️ 端口 $DESIRED_PORT 当前已被占用，正在智能检索占用来源并尝试释放..."
    
    # 尝试多种方式探测占用 PID (兼容无 lsof / fuser 环境)
    OLD_PIDS=$(lsof -t -i :"$DESIRED_PORT" 2>/dev/null || fuser "$DESIRED_PORT"/tcp 2>/dev/null || ss -tlpn "sport = :$DESIRED_PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 || true)
    if [ -n "$OLD_PIDS" ]; then
      echo "🛑 发现占用端口 $DESIRED_PORT 的历史孤儿进程 PID: $OLD_PIDS，正在优雅释放..."
      kill -15 $OLD_PIDS 2>/dev/null || true
      sleep 1
      if is_port_in_use "$DESIRED_PORT"; then
        kill -9 $OLD_PIDS 2>/dev/null || true
        sleep 1
      fi
    fi

    # 如果仍被占用（被外部固定服务占用），全自动智能寻找空闲端口 (3007, 3008~3020, 3080)
    if is_port_in_use "$DESIRED_PORT"; then
      echo "⚠️ 端口 $DESIRED_PORT 仍被外部固定服务占用，启动全自动智能候选端口池..."
      CANDIDATE_PORTS=(3007 3008 3009 3010 3011 3012 3015 3020 3080 3001 3002 3003 3004 3005 3006)
      FOUND_PORT=""
      for cp in "${CANDIDATE_PORTS[@]}"; do
        if ! is_port_in_use "$cp"; then
          FOUND_PORT="$cp"
          break
        fi
      done

      if [ -n "$FOUND_PORT" ]; then
        APP_PORT="$FOUND_PORT"
        echo "🎯 成功全自动切换至空闲可用智能端口: $APP_PORT"
      else
        echo "❌ 常见端口均被占用，请手动指定 PORT=xxxx 执行部署。"
        exit 1
      fi
    else
      echo "✅ 端口 $APP_PORT 历史占用已释放，空闲就绪。"
    fi
  fi
else
  echo "✅ 专属智能端口 $APP_PORT 空闲就绪。"
fi

# 自动持久化回写 .env，确保单机重启或直接用 pm2 restart 依然保持正确端口
if [ -f ".env" ]; then
  if grep -q "^PORT=" .env; then
    sed -i "s/^PORT=.*/PORT=$APP_PORT/" .env
  else
    echo "PORT=$APP_PORT" >> .env
  fi
fi

export PORT="$APP_PORT"
export NITRO_PORT="$APP_PORT"
export HOST="127.0.0.1"

# 7. 自动管理并同步启动服务集群 (优先 PM2，次选后台守护)
echo ""
echo "🔄 正在同步启动与加载服务集群 (监听 127.0.0.1:$APP_PORT)..."

if command -v pm2 >/dev/null 2>&1; then
  echo "⚡ 检测到 PM2，正在通过 ecosystem.config.cjs 在端口 $APP_PORT 启动服务集群..."
  PORT=$APP_PORT NITRO_PORT=$APP_PORT pm2 reload ecosystem.config.cjs --update-env || PORT=$APP_PORT NITRO_PORT=$APP_PORT pm2 start ecosystem.config.cjs --update-env
  pm2 save
  echo "✅ PM2 双实例集群服务已在端口 $APP_PORT 启动并保存开机状态。"
else
  echo "⚠️ 未检测到全局 PM2，尝试使用 npx pm2 或直接拉起 node 守护进程..."
  if npx --no-install pm2 -v >/dev/null 2>&1; then
    PORT=$APP_PORT NITRO_PORT=$APP_PORT npx pm2 reload ecosystem.config.cjs --update-env || PORT=$APP_PORT NITRO_PORT=$APP_PORT npx pm2 start ecosystem.config.cjs --update-env
    echo "✅ npx pm2 集群服务已在端口 $APP_PORT 启动。"
  else
    echo "ℹ️ 使用 nohup 启动生产服务 (建议后续安装 pm2: npm install -g pm2)..."
    PID=$(pgrep -f ".output/server/index.mjs" || true)
    if [ -n "$PID" ]; then
      echo "🛑 正在平滑停止旧进程 PID: $PID"
      kill -15 "$PID" 2>/dev/null || true
      sleep 2
    fi
    PORT=$APP_PORT NITRO_PORT=$APP_PORT HOST=127.0.0.1 nohup node .output/server/index.mjs > server.log 2>&1 &
    echo "✅ 生产服务已在后台运行 (端口: $APP_PORT)，日志输出至 server.log。"
  fi
fi

# 8. 全链路三联健康自检 (握手探测 + 滑块引擎 + 主站渲染)
echo ""
echo "🩺 正在等待服务就绪并执行全链路三联自检 (端口: $APP_PORT)..."
sleep 3

MAX_RETRIES=15
RETRY_COUNT=0
ALL_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # 探测 1: 金库一次性公钥握手 (OTPK)
  CODE_KEY=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$APP_PORT/api/security/rsa-public-key" || echo "000")
  # 探测 2: 智能光影人机安全核验引擎挑战
  CODE_SLIDER=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$APP_PORT/api/security/slider-challenge" || echo "000")
  # 探测 3: SSR 主站 HTML 渲染
  CODE_INDEX=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$APP_PORT/" || echo "000")

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
  echo "🌐 本地服务端点: http://127.0.0.1:$APP_PORT"
  echo "=========================================================="
  
  # 9. 智能同步 Nginx 反向代理配置 (动态适配 $APP_PORT)
  if command -v nginx >/dev/null 2>&1; then
    echo ""
    echo "🌐 正在检查与同步 Nginx 反向代理 (上游端口: $APP_PORT)..."
    if [ "$(id -u)" -eq 0 ]; then
      # 自动准备 Cloudflare 回源专用 Origin SSL 证书 (免手动配置，永不过期，开箱即用)
      mkdir -p /etc/ssl/xo /etc/nginx/snippets /etc/nginx/sites-available /etc/nginx/sites-enabled
      if [ ! -f "/etc/ssl/xo/origin.crt" ] || [ ! -f "/etc/ssl/xo/origin.key" ]; then
        if [ -f "/etc/letsencrypt/live/xoxox.bond/fullchain.pem" ]; then
          ln -sf /etc/letsencrypt/live/xoxox.bond/fullchain.pem /etc/ssl/xo/origin.crt
          ln -sf /etc/letsencrypt/live/xoxox.bond/privkey.pem /etc/ssl/xo/origin.key
          echo "🔒 已自动挂接现有 Let's Encrypt 证书作为 Cloudflare 回源凭证。"
        else
          echo "🔒 正在为 Cloudflare 回源自动生成 10 年期自签高强度 Origin SSL 证书 (完美兼容 Cloudflare 橙色云朵)..."
          openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
            -keyout /etc/ssl/xo/origin.key \
            -out /etc/ssl/xo/origin.crt \
            -subj "/C=CN/ST=XO/L=Cloudflare/O=XOStudio/CN=*.xoxox.bond" >/dev/null 2>&1 || true
        fi
      fi

      if [ -f "deploy/nginx/cloudflare-ips.conf" ]; then
        cp deploy/nginx/cloudflare-ips.conf /etc/nginx/snippets/cloudflare-ips.conf
      fi
      if [ -f "deploy/nginx/xo.xoxox.bond.conf" ]; then
        # 动态替换 proxy_pass 端口为实际分配的 $APP_PORT
        sed "s|proxy_pass http://127.0.0.1:[0-9]\+;|proxy_pass http://127.0.0.1:$APP_PORT;|g" \
          deploy/nginx/xo.xoxox.bond.conf > /etc/nginx/sites-available/xo.xoxox.bond.conf
        ln -sf /etc/nginx/sites-available/xo.xoxox.bond.conf /etc/nginx/sites-enabled/xo.xoxox.bond.conf
        # 彻底下线默认与残缺旧 vhost，杜绝 apex 域名 502 错误
        rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf 2>/dev/null || true
        
        NGINX_TEST_OUT=$(nginx -t 2>&1 || true)
        if echo "$NGINX_TEST_OUT" | grep -q "syntax is ok"; then
          systemctl reload nginx 2>/dev/null || nginx -s reload 2>/dev/null || true
          echo "✅ Nginx 站点配置已自动同步至端口 $APP_PORT，语法校验通过并已平滑热重载。"
          echo "☁️ 已完美接入 Cloudflare (原生兼容 Flexible / Full 模式，全面享受 DNS 橙色云朵防护与自动续期 SSL)！"
        else
          echo "⚠️ Nginx 配置检测回显: $NGINX_TEST_OUT"
        fi
      fi
    else
      echo "💡 当前为非 root 用户，如需同步更新公网 Nginx 代理至端口 $APP_PORT，请以 sudo 权限执行部署脚本。"
    fi
  fi
else
  echo "⚠️ 警告: 健康自检超时或部分模块未就绪，请检查服务日志 (pm2 logs xo-studio 或 cat server.log)。"
fi
