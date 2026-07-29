import { defineEventHandler, readBody } from 'h3'
import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {}
  const { content, title } = body

  if (!content || typeof content !== 'string') {
    return { success: false, noKey: true }
  }

  // ── Load AI settings from site-config.json ─────────────────────────
  let apiKey = ''
  let endpoint = 'https://api.openai.com/v1/chat/completions'
  let modelName = 'gpt-3.5-turbo'

  try {
    const configPath = path.join(process.cwd(), 'content', 'site-config.json')
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (configData.aiSettings) {
        apiKey = configData.aiSettings.apiKey || ''
        endpoint = configData.aiSettings.endpoint || endpoint
        modelName = configData.aiSettings.model || modelName
      }
    }
  } catch (e) {}

  // ── No API key → tell client to show excerpt directly ─────────────
  if (!apiKey) {
    return { success: false, noKey: true }
  }

  // ── Has API key → call LLM ─────────────────────────────────────────
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '[代码块]')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 3000)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的博客编辑，请用简洁自然的中文为文章生成智能摘要，概括核心要点，语言有见解有温度，60-100字即可。直接输出摘要正文，不要加引号或前缀标签。'
          },
          {
            role: 'user',
            content: `请为博客文章《${title || '无标题'}》生成 AI 智能总结：\n\n${cleanContent}`
          }
        ],
        temperature: 0.6,
        max_tokens: 300
      })
    })

    if (response.ok) {
      const json = await response.json()
      const text = json.choices?.[0]?.message?.content?.trim()
      if (text) {
        return { success: true, summary: text, source: 'llm' }
      }
    }
    // LLM call failed
    return { success: false, noKey: false, error: 'LLM call failed' }
  } catch (err: any) {
    console.error('[Blog AI Summary] Error:', err?.message)
    return { success: false, noKey: false, error: err?.message }
  }
})
