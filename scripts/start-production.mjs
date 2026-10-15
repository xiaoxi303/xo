import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function isPortFree(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => {
      s.close(() => resolve(true));
    });
    s.listen(port, host);
  });
}

async function getSmartPort() {
  const envPath = path.resolve(rootDir, '.env');
  let envPort = null;
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const m = content.match(/^PORT\s*=\s*(\d+)/m);
      if (m && m[1]) envPort = Number(m[1]);
    } catch {}
  }

  let candidate = Number(process.env.PORT) || Number(process.env.NITRO_PORT) || envPort || 3007;
  if (candidate === 3000) candidate = 3007;

  if (await isPortFree(candidate)) return candidate;

  const pool = [3007, 3008, 3009, 3010, 3011, 3012, 3015, 3020, 3080, 3001, 3002, 3003, 3004, 3005, 3006];
  for (const p of pool) {
    if (p !== candidate && (await isPortFree(p))) {
      console.log(`[SmartPort] 端口 ${candidate} 被占用，全自动切换至智能空闲端口: ${p}`);
      return p;
    }
  }
  return candidate;
}

const port = await getSmartPort();
process.env.PORT = String(port);
process.env.NITRO_PORT = String(port);
if (!process.env.HOST) process.env.HOST = '127.0.0.1';

console.log(`[SmartPort] XO Studio 生产服务智能挂载于 127.0.0.1:${port}`);

const serverEntry = path.resolve(rootDir, '.output/server/index.mjs');
if (!fs.existsSync(serverEntry)) {
  console.error('❌ 未找到生产构建产物 .output/server/index.mjs，请先执行 npm run build');
  process.exit(1);
}

await import(new URL(`file://${serverEntry.replace(/\\/g, '/')}`).href);
