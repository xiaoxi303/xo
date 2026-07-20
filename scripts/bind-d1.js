const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const wranglerConfigPath = path.resolve(__dirname, '../wrangler.toml')

console.log('🚀 开始一键绑定 Cloudflare D1 存储...')

try {
  // 1. Check if wrangler.toml exists
  if (!fs.existsSync(wranglerConfigPath)) {
    console.error('❌ 未找到 wrangler.toml 配置文件。')
    process.exit(1)
  }

  let dbId = ''
  let output = ''

  // 2. Try to create the D1 database
  try {
    console.log('📡 正在调用 Wrangler 创建 D1 数据库 (xo-db)...')
    output = execSync('npx wrangler d1 create xo-db', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
    console.log('✅ 数据库创建成功或已存在。')
  } catch (err) {
    // If it failed because it already exists or offline, let's try to query existing list
    output = err.stdout || ''
  }

  // 3. Extract database ID from creation output
  // Example output line: database_id = "xxxx-xxxx-xxxx"
  const idMatch = output.match(/database_id\s*=\s*["']([0-9a-fA-F-]{36})["']/)
  if (idMatch && idMatch[1]) {
    dbId = idMatch[1]
  } else {
    // If not found in output, try listing existing databases
    try {
      console.log('🔍 从已有列表中检索 xo-db...')
      const listOutput = execSync('npx wrangler d1 list', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
      // Parse JSON output or plain string
      if (listOutput.trim().startsWith('[')) {
        const list = JSON.parse(listOutput)
        const db = list.find(d => d.name === 'xo-db')
        if (db) dbId = db.uuid
      } else {
        const listMatch = listOutput.match(/xo-db\s+\│\s+([0-9a-fA-F-]{36})/)
        if (listMatch && listMatch[1]) {
          dbId = listMatch[1]
        }
      }
    } catch (e) {
      // ignore list errors
    }
  }

  // 4. Update wrangler.toml if dbId was found
  if (dbId) {
    console.log(`🔑 成功获取 D1 Database ID: ${dbId}`)
    let configContent = fs.readFileSync(wranglerConfigPath, 'utf8')
    
    // Replace database_id
    const updatedContent = configContent.replace(
      /database_id\s*=\s*["'][^"']*["']/g,
      `database_id = "${dbId}"`
    )
    
    fs.writeFileSync(wranglerConfigPath, updatedContent, 'utf8')
    console.log('✨ 已自动将 Database ID 写入 wrangler.toml 配置文件中！')
    console.log('\n🎉 D1 存储一键绑定完成！您现在可以使用以下方式运行或部署：')
    console.log('   - 本地开发全仿真调试: npx wrangler pages dev')
    console.log('   - 线上部署项目上线: npm run deploy')
  } else {
    console.warn('\n⚠️ 未能获取到 D1 数据库 ID。请确保您已登录 Cloudflare (npx wrangler login) 且网络畅通。')
    console.log('   您也可以手动执行: npx wrangler d1 create xo-db')
    console.log('   然后将输出的 database_id 填入 wrangler.toml')
  }
} catch (error) {
  console.error('❌ 一键绑定失败:', error.message)
}
