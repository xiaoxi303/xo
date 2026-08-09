import { defineEventHandler, readBody } from 'h3'
import { dbGetSiteConfig } from '../../utils/db'
import { requireAdminSession } from '../../utils/admin-auth'

function createCleanSummary(content: string, title?: string): string {
  if (!content) return '本文暂无正文描述，欢迎继续关注后续更新。'
  
  // Extract section titles / key headers for structured conceptual summary
  const headers = (content.match(/#{1,6}\s+(.+)/g) || [])
    .map(h => h.replace(/#{1,6}\s+/, '').replace(/\*\*/g, '').trim())
    .filter(Boolean)
    .slice(0, 3)

  const topicStr = headers.length > 0
    ? `重点梳理了「${headers.join('」、「')}」等核心范式`
    : `对相关的设计原则与技术实现路线进行了全流程归纳`

  const articleTitle = title ? `《${title}》` : '本篇文章'

  return `${articleTitle}总结了关键理念与工程落地方案，${topicStr}。全文着重提炼了视听质感与交互细节，为同类项目的开发与美学设计提供了清晰的高阶指引。`
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
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

  // If no API key configured, return clean conceptual summary
  if (!apiKey || provider === 'builtin') {
    return {
      success: true,
      summary: createCleanSummary(content, title),
      source: 'clean_extract',
      configured: false
    }
  }

  // ── API Key configured: Call LLM for 60-100 word abstractive summary ────
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
    const timeoutId = setTimeout(() => controller.abort(), 12000)

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
            content: '你是一位洞察敏锐的高级博客主编。请阅读给定的文章，撰写一段 60-100 字的【高阶总结概括】。要求：1. 归纳核心观点与价值点，绝对不要逐字复制或简单抄袭原文句子，必须进行概念重构与提炼；2. 语言优雅、流畅、有深度；3. 直接输出总结正文，禁止带有任何标题、前缀或引号。'
          },
          {
            role: 'user',
            content: `文章标题：《${title || '未命名'}》\n文章内容：\n${cleanContent}`
          }
        ],
        temperature: 0.6,
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
          .replace(/^总结[:：]\s*/i, '')
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

  // LLM call failed or timed out -> Return clean conceptual summary as fallback
  return {
    success: true,
    summary: createCleanSummary(content, title),
    source: 'llm_fallback',
    configured: true
  }
})
