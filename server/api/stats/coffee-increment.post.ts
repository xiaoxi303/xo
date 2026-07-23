import { defineEventHandler } from 'h3'
import { dbGetSiteConfig, dbSaveSiteConfig } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const siteConfig = await dbGetSiteConfig(event)
    if (!siteConfig.studioStats) {
      siteConfig.studioStats = {}
    }

    const currentCount = siteConfig.studioStats.coffeeCount || siteConfig.studioStats.coffeeCups || 0
    const newCount = currentCount + 1

    siteConfig.studioStats.coffeeCount = newCount
    siteConfig.studioStats.coffeeCups = newCount

    await dbSaveSiteConfig(event, siteConfig)

    return {
      success: true,
      coffeeCount: newCount,
      message: '☕ 剪辑师续命 +1 成功！已保存回服务端磁盘。'
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || '存盘失败'
    }
  }
})
