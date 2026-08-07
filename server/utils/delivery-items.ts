import fs from 'node:fs'
import { getRuntimeDataPath } from './storage'

export interface DeliveryItem {
  id: string
  deliverySuffix: string
  title: string
  description: string
  videoUrl: string
  poster: string
  enabled: boolean
  updatedAt: string
}

const filePath = getRuntimeDataPath('delivery-items.json')
const normalize = (v: any) => String(v || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
function readAll(): DeliveryItem[] {
  if (!fs.existsSync(filePath)) return []
  try { const value = JSON.parse(fs.readFileSync(filePath, 'utf8')); return Array.isArray(value) ? value : [] } catch { return [] }
}
function writeAll(items: DeliveryItem[]) { fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8') }
export const getDeliveryItems = () => readAll()
export const getDeliveryItemsBySuffix = (suffix: string) => readAll().filter(item => item.enabled && item.deliverySuffix === normalize(suffix))
export function saveDeliveryItem(input: Partial<DeliveryItem>) {
  const id = String(input.id || `delivery_${Date.now()}`)
  const deliverySuffix = normalize(input.deliverySuffix)
  if (!deliverySuffix || !String(input.title || '').trim() || !String(input.videoUrl || '').trim()) throw new Error('请填写交付后缀、视频标题和视频地址')
  const next: DeliveryItem = { id, deliverySuffix, title: String(input.title).trim(), description: String(input.description || '').trim(), videoUrl: String(input.videoUrl).trim(), poster: String(input.poster || '').trim(), enabled: input.enabled !== false, updatedAt: new Date().toISOString() }
  const items = readAll(); const index = items.findIndex(item => item.id === id)
  if (index >= 0) items[index] = next; else items.unshift(next)
  writeAll(items); return next
}
export function deleteDeliveryItem(id: string) { writeAll(readAll().filter(item => item.id !== String(id))) }
