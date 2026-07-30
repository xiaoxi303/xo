import { defineEventHandler, readBody } from 'h3'
import { dbGetSiteConfig } from '../../utils/db'

function createCleanSummary(content: string): string {
  if (!content) return '这篇博文暂无具体正文描述。'
  
  let clean = content
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^\s*\d+\.\s+/gm, '') // ordered list numbers
    .replace(/^\s*[-*+]\s+/gm, '') // unordered lists
    .replace(/\n+/g, ' ') // collapse newlines
    .replace(/\s+/g, ' ') // collapse spaces
    .trim()

  if (clean.length <= 140) return clean
  return clean.slice(0, 135) + '...'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event) || {}
  const { content, title } = body

  if (!content || typeof content !== 'string') {
    return { success: false, summary: '暂无文章正文。' }
  }

  // ── Load AI settings using dbGetSiteConfig (DB / File persistent) ─────
  const siteConfig = await dbGetSiteConfig(event).catch(() => ({}))
  const aiSettings = siteConfig?.aiSettings || {}

  const apiKey = (aiSettings.apiKey || '').trim()
  const provider = aiSettings.provider || 'custom'
  let endpoint = (aiSettings.apiEndpoint || aiSettings.endpoint || '').trim()
  const modelName = (aiSettings.modelName || aiSettings.model || (provider === 'openai' ? 'gpt-4o-mini' : 'deepseek-chat')).trim()

  // Resolve default endpoint for known providers if blank
  if (!endpoint) {
    if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/v1'
    else if (provider === 'openai') endpoint = 'https://api.openai.com/v1'
    else if (provider === 'gemini') endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/'
    else endpoint = 'https://api.openai.com/v1'
  }

  if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1)
  if (!endpoint.endsWith('/chat/completions')) {
    endpoint = `${endpoint}/chat/completions`
  }

  // If no API key configured, return clean extracted text directly
  if (!apiKey || provider === 'builtin') {
    return {
      success: true,
      summary: createCleanSummary(content),
      source: 'clean_extract',
      configured: false
    }
  }

  // ── API Key configured: Call LLM ──────────────────────────────────
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
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000) // 12s timeout

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
            content: '你是一位专业的博客编辑，请用简洁自然的中文为文章生成 60-100 字的 AI 智能总结，概括核心要点，直接输出总结正文，不要包含 Markdown 标题符号或引号。'
          },
          {
            role: 'user',
            content: `文章标题：《${title || '未命名'}》\n文章内容：\n${cleanContent}`
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const json = await response.json()
      const text = json.choices?.[0]?.message?.content?.trim()
      if (text) {
        // Strip any wrapping quotes or markdown headers if LLM included them
        const cleanedText = text
          .replace(/^["'「`]+|["'」`]+$/g, '')
          .replace(/^AI(智能)?总结[:：]\s*/i, '')
          .trim()

        return {
          success: true,
          summary: cleanedText,
          source: 'llm',
          model: modelName,
          configured: true
        }
      }
    } else {
      const errorText = await response.text().catch(() => '')
      console.error(`[Blog AI Summary] LLM API Call Error (${response.status}):`, errorText)
    }
  } catch (err: any) {
    console.error('[Blog AI Summary] LLM Fetch Exception:', err?.message || err)
  }

  // LLM call failed or timed out -> Return clean extracted text as fallback
  return {
    success: true,
    summary: createCleanSummary(content),
    source: 'llm_fallback',
    configured: true
  }
})
