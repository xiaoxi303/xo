const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ── 全量同步装载 .env 生产配置 ──────────────────────────────────────────────
const envPath = path.resolve(__dirname, '.env');
const loadedEnv = {};
if (fs.existsSync(envPath)) {
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key) {
          loadedEnv[key] = val;
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  } catch (e) {}
}

/**
 * 全自动智能端口机制 (Smart Port Auto-Detection & Self-Healing)
 * 1. 优先使用环境变量 PORT 或 NITRO_PORT
 * 2. 其次读取 .env 中的 PORT 配置
 * 3. 默认项目专属端口统一定义为 3007 (彻底杜绝 3000 默认端口冲突)
 * 4. 若端口被外部占用，全自动切换至空闲端口 (3007, 3008~3020) 并同步持久化
 */
function isPortAvailable(port, host = '127.0.0.1') {
  try {
    const probe = "const net = require('net'); const s = net.createServer(); s.once('error', () => process.exit(1)); s.once('listening', () => s.close(() => process.exit(0))); s.listen(" + port + ", '" + host + "');";
    const res = spawnSync(process.execPath, ['-e', probe], { stdio: 'ignore', timeout: 1500 });
    return res.status === 0;
  } catch (e) {
    return false;
  }
}

function resolveSmartPort() {
  if (process.env.PORT && !isNaN(Number(process.env.PORT))) {
    const p = Number(process.env.PORT);
    return p === 3000 ? 3007 : p;
  }

  let envPort = loadedEnv.PORT ? Number(loadedEnv.PORT) : null;
  let targetPort = envPort || 3007;
  if (targetPort === 3000) targetPort = 3007;

  if (isPortAvailable(targetPort)) return targetPort;

  const candidatePool = [3007, 3008, 3009, 3010, 3011, 3012, 3015, 3020, 3080, 3001, 3002, 3003, 3004, 3005, 3006];
  for (const candidate of candidatePool) {
    if (candidate !== targetPort && isPortAvailable(candidate)) {
      console.log(`[SmartPort] 端口 ${targetPort} 已被占用，已全自动切换至智能空闲端口: ${candidate}`);
      try {
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          if (/^PORT\s*=/m.test(envContent)) {
            envContent = envContent.replace(/^PORT\s*=.*/m, `PORT=${candidate}`);
          } else {
            envContent += `\nPORT=${candidate}\n`;
          }
          fs.writeFileSync(envPath, envContent);
        }
      } catch (e) {}
      return candidate;
    }
  }

  return targetPort;
}

const SMART_PORT = resolveSmartPort();

module.exports = {
  apps: [
    {
      name: 'xo-studio',
      script: './.output/server/index.mjs',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        ...loadedEnv,
        NODE_ENV: 'production',
        PORT: SMART_PORT,
        NITRO_PORT: SMART_PORT,
        HOST: '127.0.0.1'
      }
    }
  ]
};
