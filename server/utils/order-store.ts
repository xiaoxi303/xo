import fs from 'node:fs'
import { getRuntimeDataPath, readEncryptedJson, writeEncryptedJson } from './storage'

const orderPath = getRuntimeDataPath('orders.json')

export interface OrderRecord {
  outTradeNo: string
  suffix: string
  subject: string
  amount: string
  status: 'created' | 'paid' | 'closed'
  tradeNo?: string
  buyerLogonId?: string
  buyerUserId?: string
  buyerPayAmount?: string
  tradeStatus?: string
  note?: string
  createdAt: string
  paidAt?: string
  clientUsername?: string
  clientName?: string
  bookingId?: string
}

function readOrders(): OrderRecord[] {
  return readEncryptedJson<OrderRecord[]>(orderPath, [])
}

export function saveOrder(order: OrderRecord) {
  const orders = readOrders()
  orders.unshift(order)
  writeEncryptedJson(orderPath, orders.slice(0, 5000))
}

export function getOrders() {
  return readOrders()
}

export function updateOrder(outTradeNo: string, patch: Partial<OrderRecord>) {
  const orders = readOrders()
  const index = orders.findIndex(order => order.outTradeNo === outTradeNo)
  if (index < 0) return null
  const prevStatus = orders[index].status
  orders[index] = { ...orders[index], ...patch }
  writeEncryptedJson(orderPath, orders.slice(0, 5000))
  const current = orders[index]

  // If order transitioned to paid, sync with bookings.json
  if (current.status === 'paid' && prevStatus !== 'paid') {
    try {
      const bookingsPath = getRuntimeDataPath('bookings.json')
      const bookings = readEncryptedJson<any[]>(bookingsPath, [])
      let modified = false
      for (const b of bookings) {
        const matchBookingId = current.bookingId && b.id === current.bookingId
        const matchSuffix = current.suffix && (b.orderSuffix === current.suffix || b.deliverySuffix === current.suffix)
        if (matchBookingId || matchSuffix) {
          b.status = 'paid'
          b.paidAt = current.paidAt || new Date().toISOString()
          b.paidAmount = current.amount
          b.outTradeNo = current.outTradeNo
          b.tradeNo = current.tradeNo || b.tradeNo
          b.updatedAt = new Date().toISOString()
          modified = true
        }
      }
      if (modified) {
        writeEncryptedJson(bookingsPath, bookings)
      }
    } catch (e) {
      console.error('Failed to sync paid order to bookings.json:', e)
    }
  }

  return current
}
