import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'

const orderPath = getRuntimeDataPath('orders.json')

export interface OrderRecord {
  outTradeNo: string
  suffix: string
  subject: string
  amount: string
  status: 'created' | 'paid' | 'closed'
  tradeNo?: string
  note?: string
  createdAt: string
  paidAt?: string
}

function readOrders(): OrderRecord[] {
  if (!fs.existsSync(orderPath)) return []
  try {
    const value = JSON.parse(fs.readFileSync(orderPath, 'utf8'))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function saveOrder(order: OrderRecord) {
  const orders = readOrders()
  orders.unshift(order)
  fs.writeFileSync(orderPath, JSON.stringify(orders.slice(0, 5000), null, 2), 'utf8')
}

export function getOrders() {
  return readOrders()
}

export function updateOrder(outTradeNo: string, patch: Partial<OrderRecord>) {
  const orders = readOrders()
  const index = orders.findIndex(order => order.outTradeNo === outTradeNo)
  if (index < 0) return null
  orders[index] = { ...orders[index], ...patch }
  fs.writeFileSync(orderPath, JSON.stringify(orders, null, 2), 'utf8')
  return orders[index]
}
