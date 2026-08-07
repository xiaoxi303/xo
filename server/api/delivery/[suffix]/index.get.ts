import { getRouterParam } from 'h3'
import {
  dbGetUserByDeliverySuffix,
  dbGetUsers
} from '../../../utils/db'
import { getDeliveryItemsBySuffix } from '../../../utils/delivery-items'

const DELIVERY_RULES = [
  {
    id: 'scope',
    title: '专属范围',
    text: '此入口只展示被分配给当前客户账号的交付项目。'
  },
  {
    id: 'security',
    title: '访问安全',
    text: '请勿尝试访问其他客户的入口或传播查看密钥。'
  },
  {
    id: 'refund',
    title: '交付规则',
    text: '因违规访问导致的封禁不解除，已支付费用不予退还。'
  }
]

function cleanSuffix(value: unknown) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
}

export default defineEventHandler(async (event) => {
  const suffix = cleanSuffix(getRouterParam(event, 'suffix'))
  if (!suffix) {
    throw createError({ statusCode: 400, statusMessage: '缺少交付入口后缀。' })
  }

  // Backfill credentials for legacy users before looking up the suffix.
  await dbGetUsers(event)
  const user = await dbGetUserByDeliverySuffix(event, suffix)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: '交付入口不存在或已失效。' })
  }
  if (user.isBlacklisted) {
    throw createError({ statusCode: 403, statusMessage: '该交付入口已被停用。' })
  }

  return {
    success: true,
    delivery: {
      suffix,
      keyHint: user.deliveryKeyHint || '',
      requiresKey: true
    },
    rules: DELIVERY_RULES
    ,itemCount: getDeliveryItemsBySuffix(suffix).length
  }
})

export { DELIVERY_RULES }
