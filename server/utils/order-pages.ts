import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'

export interface OrderPageConfig {
  suffix: string
  enabled: boolean
  subject: string
  amount: string
  description: string
  clientName: string
  successText: string
  updatedAt: string
}

const filePath = getRuntimeDataPath('order-pages.json')

function normalizeSuffix(value: any) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
}

function readAll(): OrderPageConfig[] {
  if (!fs.existsSync(filePath)) return [{
    suffix: 'xiao',
    enabled: true,
    subject: '影视后期制作服务',
    amount: '1.00',
    description: '请在后台订单管理中编辑本订单的商品名称、金额和交付说明。',
    clientName: '',
    successText: '支付成功后，我们会按约定完成交付。',
    updatedAt: new Date().toISOString()
  }]
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(pages: OrderPageConfig[]) {
  fs.writeFileSync(filePath, JSON.stringify(pages, null, 2), 'utf8')
}

export function getOrderPages() {
  return readAll()
}

export function getOrderPage(suffix: string) {
  const normalized = normalizeSuffix(suffix)
  return readAll().find(page => page.suffix === normalized) || null
}

export function saveOrderPage(input: Partial<OrderPageConfig>) {
  const suffix = normalizeSuffix(input.suffix)
  if (!suffix) throw new Error('订单后缀不能为空。')
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount < 0.01 || amount > 100000) {
    throw new Error('订单金额必须在 0.01 至 100000 元之间。')
  }
  const pages = readAll()
  const existing = pages.findIndex(page => page.suffix === suffix)
  const next: OrderPageConfig = {
    suffix,
    enabled: input.enabled !== false,
    subject: String(input.subject || '').trim(),
    amount: amount.toFixed(2),
    description: String(input.description || '').trim(),
    clientName: String(input.clientName || '').trim(),
    successText: String(input.successText || '支付成功后，项目负责人会按约定交付。').trim(),
    updatedAt: new Date().toISOString()
  }
  if (!next.subject) throw new Error('商品名称不能为空。')
  if (existing >= 0) pages[existing] = next
  else pages.unshift(next)
  writeAll(pages)
  return next
}

export function deleteOrderPage(suffix: string) {
  const normalized = normalizeSuffix(suffix)
  writeAll(readAll().filter(page => page.suffix !== normalized))
}
