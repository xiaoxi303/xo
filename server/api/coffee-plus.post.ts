import { defineEventHandler, getCookie } from 'h3'
import { dbGetSiteConfig, dbSaveSiteConfig } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const config = await dbGetSiteConfig(event)
    if (!config.studioStats) {
      config.studioStats = {
        renderHours: '1,280 Hours',
        davinciNodes: '4,520 Nodes',
        storageThroughput: '32.5 TB',
        coffeeCups: 342
      }
    }

    // Increment coffee counter
    const currentCups = Number(config.studioStats.coffeeCups) || 342
    config.studioStats.coffeeCups = currentCups + 1

    await dbSaveSiteConfig(event, config)

    return {
      success: true,
      coffeeCups: config.studioStats.coffeeCups,
      message: '☕ 咖啡 +1 成功！给剪辑师注入了一杯续命高纯度咖啡。'
    }
  } catch (error: any) {
    return {
      success: false,
      message: '点赞咖啡失败。'
    }
  }
})
