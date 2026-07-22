import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { validateSession, SESSION_COOKIE } from '../../utils/auth'
import { dbGetSiteConfig } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // Authentication check (admin session only)
  const token = getCookie(event, SESSION_COOKIE)
  if (!token || !validateSession(token)) {
    throw createError({ statusCode: 401, statusMessage: '未经授权的请求。' })
  }

  const body = await readBody(event)
  const prompt = (body?.prompt || '').trim()

  if (!prompt) {
    throw createError({ statusCode: 400, statusMessage: '请输入影片名称或灵感描述。' })
  }

  // 1. Fetch site config and check for configured external AI Model API settings
  const siteConfig = await dbGetSiteConfig(event)
  const aiSettings = siteConfig?.aiSettings || {}

  const isExternalAiConfigured =
    aiSettings.provider &&
    aiSettings.provider !== 'builtin' &&
    aiSettings.apiKey &&
    aiSettings.apiKey.trim().length > 0

  if (isExternalAiConfigured) {
    let endpoint = (aiSettings.apiEndpoint || '').trim()

    // Smart default endpoints for known providers if left blank or simple
    if (!endpoint || endpoint === 'https://api.deepseek.com/v1') {
      if (aiSettings.provider === 'deepseek') endpoint = 'https://api.deepseek.com/v1'
      else if (aiSettings.provider === 'openai') endpoint = 'https://api.openai.com/v1'
      else if (aiSettings.provider === 'gemini') endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/'
      else endpoint = 'https://api.deepseek.com/v1'
    }

    if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1)
    if (!endpoint.endsWith('/chat/completions')) {
      endpoint = `${endpoint}/chat/completions`
    }

    const modelName = (aiSettings.modelName || (aiSettings.provider === 'openai' ? 'gpt-4o-mini' : 'deepseek-chat')).trim()

    const systemPrompt = `你是一位享誉国际的顶级影视剪辑指导、DI 色彩总监与 Quiet Luxury 视觉艺术大师。
你的任务是根据用户输入的任意影片名称、品牌、灵感或题材描述，完全自由地、从零创作一份 100% 独一无二、毫无套路模板痕迹的大刊级作品集案例剖析。

创作要求：
1. 拒绝任何公式化句式与固定模板。必须围绕用户的特定主题（例如用户输入"信息流"就深度剖析信息流的完播率钩子与卡点美学；输入"保时捷"就剖析暗金金属漆光影；输入"AIGC"就剖析潜空间插帧；输入"豪宅"就剖析自然日光影调）。
2. 语言风格符合 Vogue / Harper's BAZAAR 大刊级高奢调性（Quiet Luxury），用词优雅、专业、极具视听张力。
3. longDescription 请使用高质感 Markdown 格式编写，包含 3-4 个深度剖析章节，自定义最具洞察力的 Markdown 标题（如 ### 01. ... / ### 02. ...）。
4. 严格输出 JSON 格式（不要包裹任何解释说明），字段结构如下：
{
  "title": "自由创作的顶级作品标题（高度契合用户的输入主题）",
  "slug": "对应英文短横杠 slug",
  "description": "自由撰写的 1 句大刊级 Quiet Luxury 优雅总结",
  "longDescription": "完全自由创作的 3-4 章节深度案例剖析 Markdown（包含调色科学、剪辑节奏、声音工程、视听感受等）",
  "postSpecs": "针对该项目精准定制的工业级后期规格（如 4K 60FPS Vertical / DCI 4K 24FPS / 8K HDR10 等）",
  "deliverFormat": "针对该项目精准定制的交付格式（如 ProRes 4444 XQ / ProRes RAW / OpenEXR 等）",
  "audioFormat": "针对该项目精准定制的音频规格（如 24-bit 96kHz Spatial Audio / 5.1 Surround 等）",
  "software": ["根据主题智能推导并匹配的 3-6 个软件与 AI 工具，如 DaVinci Resolve, Premiere Pro, 即梦 AI, Runway Gen-3, ComfyUI, Cinema 4D"],
  "tags": ["根据主题提炼的 4-6 个独一无二的标签"],
  "workflow": [
    { "phase": "Phase 01", "title": "自由定制的阶段1标题", "desc": "阶段1详细描述" },
    { "phase": "Phase 02", "title": "自由定制的阶段2标题", "desc": "阶段2详细描述" },
    { "phase": "Phase 03", "title": "自由定制的阶段3标题", "desc": "阶段3详细描述" }
  ]
}`

    try {
      const requestPayload: any = {
        model: modelName,
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `作品名称/灵感描述：${prompt}` }
        ]
      }

      // Add response_format json_object for supported models
      if (aiSettings.provider === 'deepseek' || aiSettings.provider === 'openai') {
        requestPayload.response_format = { type: 'json_object' }
      }

      const aiRes: any = await $fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.apiKey.trim()}`
        },
        body: requestPayload,
        timeout: 30000
      })

      if (aiRes && aiRes.choices && aiRes.choices[0]?.message?.content) {
        let rawContent = aiRes.choices[0].message.content.trim()
        
        // Extract JSON string safely between first { and last }
        const firstBrace = rawContent.indexOf('{')
        const lastBrace = rawContent.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          rawContent = rawContent.substring(firstBrace, lastBrace + 1)
        }

        const parsed = JSON.parse(rawContent)
        if (parsed.title && parsed.description) {
          return {
            success: true,
            data: parsed,
            source: `real_model_${aiSettings.provider}`
          }
        }
      }
    } catch (extErr: any) {
      const errMsg = extErr.data?.error?.message || extErr.data?.message || extErr.message || '网络无法连接到大模型 Endpoint'
      console.error(`External AI API call to ${aiSettings.provider} failed:`, errMsg)
      throw createError({
        statusCode: 502,
        statusMessage: `调用 ${aiSettings.provider.toUpperCase()} 大模型 API 失败: ${errMsg}。请检查站点设置中的 API Key、Base Endpoint 或 Model ID。`
      })
    }
  }

  // 2. Built-in Dynamic Quiet Luxury AI Generator (Hyper-Dynamic Non-Templated Fallback)
  const pLower = prompt.toLowerCase()

  let cleanName = prompt
    .replace(/(商业广告|概念片|宣传片|短片|MV|视频|生成|AI|纪录片|TVC|大片|作品|剪辑|调色)/gi, '')
    .trim()
  if (!cleanName) cleanName = prompt

  let slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!slug || slug.length < 3) {
    slug = `project-${Date.now().toString(36)}`
  }

  const detectedSoftware: string[] = []
  if (pLower.includes('即梦')) detectedSoftware.push('即梦 AI')
  if (pLower.includes('runway')) detectedSoftware.push('Runway Gen-3')
  if (pLower.includes('luma')) detectedSoftware.push('Luma Dream Machine')
  if (pLower.includes('可灵')) detectedSoftware.push('可灵 AI')
  if (pLower.includes('comfyui')) detectedSoftware.push('ComfyUI')
  if (pLower.includes('midjourney')) detectedSoftware.push('Midjourney')
  if (pLower.includes('sora')) detectedSoftware.push('Sora')
  if (pLower.includes('c4d') || pLower.includes('cinema 4d')) detectedSoftware.push('Cinema 4D')
  if (pLower.includes('ae') || pLower.includes('after effects')) detectedSoftware.push('After Effects')
  if (pLower.includes('pr') || pLower.includes('premiere')) detectedSoftware.push('Premiere Pro')
  if (pLower.includes('davinci') || pLower.includes('达芬奇')) detectedSoftware.push('DaVinci Resolve')
  if (pLower.includes('fcp') || pLower.includes('final cut')) detectedSoftware.push('FCPX')

  let category = 'general'
  if (pLower.includes('信息流') || pLower.includes('短视频') || pLower.includes('信息') || pLower.includes('千川') || pLower.includes('抖音') || pLower.includes('小红书') || pLower.includes('带货') || pLower.includes('电商')) {
    category = 'social_feed'
  } else if (pLower.includes('ai') || pLower.includes('aigc') || pLower.includes('sora') || pLower.includes('runway') || pLower.includes('comfyui') || pLower.includes('即梦') || pLower.includes('生成') || pLower.includes('扩散')) {
    category = 'ai_video'
  } else if (pLower.includes('车') || pLower.includes('保时捷') || pLower.includes('奔驰') || pLower.includes('宝马') || pLower.includes('奥迪') || pLower.includes('法拉利') || pLower.includes('高奢') || pLower.includes('汽车')) {
    category = 'automotive'
  } else if (pLower.includes('广告') || pLower.includes('tvc') || pLower.includes('商业') || pLower.includes('品牌') || pLower.includes('宣传片')) {
    category = 'commercial'
  } else if (pLower.includes('电影') || pLower.includes('短片') || pLower.includes('剧情') || pLower.includes('故事') || pLower.includes('微电影')) {
    category = 'film'
  } else if (pLower.includes('mv') || pLower.includes('时尚') || pLower.includes('音乐录影带') || pLower.includes('秀场') || pLower.includes('美妆')) {
    category = 'fashion_mv'
  } else if (pLower.includes('科技') || pLower.includes('手机') || pLower.includes('数码') || pLower.includes('发布会') || pLower.includes('硬件')) {
    category = 'tech'
  } else if (pLower.includes('特效') || pLower.includes('赛博') || pLower.includes('vfx') || pLower.includes('三维') || pLower.includes('cg') || pLower.includes('科幻')) {
    category = 'cyberpunk_vfx'
  } else if (pLower.includes('纪录片') || pLower.includes('人文') || pLower.includes('纪实') || pLower.includes('旅行') || pLower.includes('风光')) {
    category = 'documentary'
  } else if (pLower.includes('live') || pLower.includes('现场') || pLower.includes('演唱会') || pLower.includes('音乐节') || pLower.includes('快剪')) {
    category = 'live_concert'
  }

  let title = `${cleanName} · 视效作品`
  let description = ''
  let longDescription = ''
  let postSpecs = ''
  let deliverFormat = ''
  let audioFormat = ''
  let software: string[] = []
  let tags: string[] = []
  let workflow: { phase: string; title: string; desc: string }[] = []

  switch (category) {
    case 'social_feed':
      title = `${cleanName} · 高转化率爆款视效剪辑`
      description = `打破常规短视频叙事，以 ${cleanName} 前置黄金 3 秒视觉钩子与极速卡点，锤炼高完播率与高转化率传播大片。`
      postSpecs = '4K 60FPS Vertical 9:16'
      deliverFormat = 'ProRes 422 HQ / Rec.709'
      audioFormat = '24-bit 48kHz Stereo'
      software = Array.from(new Set([...detectedSoftware, 'Premiere Pro', 'DaVinci Resolve', 'After Effects']))
      tags = ['信息流', '短视频', cleanName, '黄金3秒钩子', '高转化率', '卡点剪辑']
      longDescription = `### 01. 前置黄金 3 秒视觉钩子与痛点捕捉 (${cleanName})
针对《${cleanName}》的受众心理，在开篇 3 秒前置高能镜头与强对比反常识画面。毫秒级卡点切割结合视听快脉冲，瞬间把完播率与留存率拉满。

### 02. 视听卡点与高爆发传播节奏 (Pacing & Conversion)
运用快节奏镜剪与无缝跳切，将产品卖点/核心悬念融入背景音轨强拍。兼顾叙事连贯性与短视频高留存率。

### 03. DI 达芬奇通透调色与花字视觉包装 (Color Science & Motion Graphics)
在 DaVinci Resolve 中校准高亮通透的肤色与产品固有色，叠加高质感动态花字与音效强调，确保在手机端大屏展现极致视觉冲击。`
      workflow = [
        { phase: 'Phase 01', title: '黄金前 3 秒 Hook 剪辑与前置视觉卡位', desc: `梳理《${cleanName}》核心爆点与视听痛点，前置黄金 3 秒高能镜头奠定高完播率。` },
        { phase: 'Phase 02', title: 'DI 达芬奇高饱通透调校与花字包装', desc: `增强手机大屏色彩对比度与皮肤透亮感，嵌入高辨识度花字与爆音音效。` },
        { phase: 'Phase 03', title: '4K 9:16 / 16:9 多平台 Master 交付', desc: `导出适应抖音、千川、小红书与微信视频号的无损高清全平台发布版本。` }
      ]
      break

    case 'ai_video':
      title = `${cleanName} · AIGC 潜空间神经生成视觉`
      description = `融合 ${prompt} 核心灵感与神经网络 Latent 潜空间扩散，以 Quiet Luxury 美学重构 ${cleanName} 的先锋光影景象。`
      postSpecs = '4K 60FPS AI Upscaled'
      deliverFormat = 'ProRes 4444 / Neural Latent Color'
      audioFormat = '24-bit 96kHz Spatial Audio'
      software = Array.from(new Set([...detectedSoftware, '即梦 AI', 'Runway Gen-3', 'ComfyUI', 'DaVinci Resolve', 'After Effects']))
      tags = ['AIGC', 'AI生成视频', '扩散模型', cleanName, '神经渲染', '未来科技']
      longDescription = `### 01. AIGC 提示词蒸馏与 Latent 潜空间生成 (${cleanName})
针对《${cleanName}》的视觉内核，运用神经网络视频扩散模型（包含 ComfyUI / Runway Gen-3 / 即梦 AI），蒸馏高维意向提示词。通过 Latent 空间高阶插帧与运动矢量控制，保留极致微妙的微光流变与质感颗粒。

### 02. DI 达芬奇超分重构与电影级调色 (Color Science & Refinement)
将 AI 生成的数字动态视频引入 DaVinci Resolve 19 达芬奇 Neural Engine 执行 4K AI 降噪与超分重构。匹配 ACES 1.3 工业级色彩管理，将 AIGC 的数字冷感转化为古典胶片般细腻肉感的高光与透亮肤色。

### 03. 空间音效设计与三维沉浸声场 (Spatial Audio Engineering)
采用 24-bit 96kHz 无损立体声与低频脉冲音效，将合成器音流与镜头跳切精准交织，赋予《${cleanName}》前所未有的科幻沉浸感与情绪张力。`
      workflow = [
        { phase: 'Phase 01', title: 'Multi-Model Prompt 提示词分镜卡位', desc: `蒸馏《${cleanName}》核心视觉提示词，建立种子节点与控制网络，生成高质感动态源素材。` },
        { phase: 'Phase 02', title: 'Neural Latent Motion 神经扩散与插帧', desc: `结合 Runway 与 Topaz Video AI 执行神经插帧与无损放大，消除 AI 画面抖动与伪影。` },
        { phase: 'Phase 03', title: 'DI 达芬奇超分重构与 4K Master 交付', desc: `引入 DaVinci ACES 色彩空间压制高光，注入真实胶片颗粒，导出 ProRes 4444 商业级母带。` }
      ]
      break

    case 'automotive':
      title = `${cleanName} · 高奢汽车概念大片`
      description = `基于 ${cleanName} 车身力学与暗金光影，以变形宽银幕镜头结合达芬奇 DI 色彩科学，锤炼极致速度与奢华美学。`
      postSpecs = '4K 60FPS Anamorphic'
      deliverFormat = 'ARRI LogC4 to Rec.709'
      audioFormat = '24-bit 96kHz 5.1 Surround'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro', 'Cinema 4D', 'Redshift']))
      tags = ['汽车商业片', cleanName, '变形宽银幕', '暗金调色', '高光细节', '机械力学']
      longDescription = `### 01. 光影与金属车漆质感 (${cleanName})
基于 ARRI LogC4 广色域宽容度曲线，在 DaVinci DI 色彩实验室中构建专属《${cleanName}》的“玄武暗金”色调。针对车身哑光金属漆与流线型高光执行单色相精细分离，呈现沉稳奢华的视觉光彩。

### 02. 速度感卡点与镜剪节奏 (Editing Mechanics)
利用气缸爆震与引擎轰鸣的真实声轨峰值，进行毫秒级精准卡点剪辑。结合追车镜头摇移与微距镜头切割，展现《${cleanName}》车身极速跃进时的律动美感。

### 03. 三维高精光效与 CGI 合成 (3D & VFX Motion)
结合 Cinema 4D 与 Redshift 渲染器合成高质感粒子烟尘与空气动力学流线，赋予影片顶尖车企公映大片的震撼质感。`
      workflow = [
        { phase: 'Phase 01', title: 'Offline 粗剪与引擎声轨精准卡点', desc: `根据《${cleanName}》发动机震浪与音效波形卡位，奠定震撼利落的剪辑基调。` },
        { phase: 'Phase 02', title: 'DI 达芬奇暗金色调与漆面光泽重构', desc: `压制高光反射，分离车漆单色相，打造极致暗奢的玄武金质感。` },
        { phase: 'Phase 03', title: '5.1 环绕声混音与 4K ProRes 4444 交付', desc: `整合引擎原声采样与母带压限，完成全局公映级 Master 导出。` }
      ]
      break

    case 'commercial':
      title = `${cleanName} · TVC 商业概念广告`
      description = `融合 ${cleanName} 大刊级静物拍摄、极致卡点节奏与色彩科学，为品牌塑造高奢 Quiet Luxury 现代美学。`
      postSpecs = '4K 60FPS HDR'
      deliverFormat = 'ProRes 4444 XQ / Rec.709'
      audioFormat = '24-bit 48kHz Uncompressed'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro', 'After Effects']))
      tags = ['商业广告', 'TVC', cleanName, '卡点剪辑', '高光细节', '品牌大片']
      longDescription = `### 01. 商业级品牌调性塑造 (${cleanName})
遵循现代极奢设计理念，在《${cleanName}》镜头编排上融合高帧率慢动作与快节奏镜头拼接。以静衬动，打造具有呼吸感的大刊封面视觉体验。

### 02. DI 达芬奇色彩管理 (DI Color Management)
在 Rec.709 与 HDR 两种规范间精细校准，针对产品材质、肤色透亮感进行高精度 Mask 蒙版分离，使《${cleanName}》画面高光柔润而不暴晒，暗部沉静而不失细节。

### 03. 动效包装与声音强化 (Motion & SFX)
嵌入无缝光影过渡与极简三维文字包装，配合沉浸式音效层次强化《${cleanName}》核心卖点，打造顶尖商业标杆。`
      workflow = [
        { phase: 'Phase 01', title: 'Offline 粗剪与品牌叙事搭骨架', desc: `梳理《${cleanName}》核心卖点，按商业 TVC 黄金节奏搭建镜头框架。` },
        { phase: 'Phase 02', title: 'DI 达芬奇高精肤色与产品色彩分离', desc: `精细校准产品固有色与人物肤色，呈现富贵自然的 Quiet Luxury 质感。` },
        { phase: 'Phase 03', title: '4K ProRes 4444 XQ 商业全套交付', desc: `输出包含广电级 Rec.709 与网页高清晰度版本的商业 Master 文件。` }
      ]
      break

    default:
      title = `${cleanName} · 独立视听概念创作`
      description = `为《${cleanName}》量身定制的视听解构美学，以 Quiet Luxury 笔触融入达芬奇 DI 色彩科学与卡点剪辑。`
      postSpecs = '4K 60FPS HDR'
      deliverFormat = 'ProRes 4444 XQ / Rec.709'
      audioFormat = '24-bit 48kHz Uncompressed'
      software = Array.from(new Set([...detectedSoftware, 'DaVinci Resolve', 'Premiere Pro', 'After Effects']))
      tags = ['视听解构', cleanName, '达芬奇调色', '高光细节', '剪辑节奏']
      longDescription = `### 01. 《${cleanName}》视听内核与镜头语言
围绕《${cleanName}》的题材张力，重新组合高帧率慢动作与快节奏叙事，使画面充满呼吸感与沉浸感。

### 02. DI 色彩科学与光影解调 (Color Science - ${cleanName})
在 DaVinci Resolve 19 中建立专属色彩管理流程，控制高光过暴与暗部噪声，保留《${cleanName}》丰富的细节过渡。

### 03. 声音工程与 4K Master 交付 (Sound & Master)
整合多轨无损原声与背景音效，压制母带包，导出 ProRes 4444 XQ 广播级公映文件。`
      workflow = [
        { phase: 'Phase 01', title: `《${cleanName}》镜头语言切割与粗剪`, desc: `分析《${cleanName}》音频波形与击鼓节点，建立精准镜头卡位线。` },
        { phase: 'Phase 02', title: `DI 达芬奇《${cleanName}》专属影调重构`, desc: `分离主题主色调与环境影调，打造细腻润泽的视听质感。` },
        { phase: 'Phase 03', title: `4K Master 商业级母带压制输出`, desc: `合成全套高级文字包装，完成高保真声轨压限与导出。` }
      ]
      break
  }

  return {
    success: true,
    data: {
      title,
      slug,
      description,
      longDescription,
      postSpecs,
      deliverFormat,
      audioFormat,
      software,
      tags,
      workflow
    },
    source: 'builtin_luxury_engine'
  }
})
