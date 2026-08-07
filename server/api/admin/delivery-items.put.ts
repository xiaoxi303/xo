import { getCookie } from 'h3'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { saveDeliveryItem } from '../../utils/delivery-items'
export default defineEventHandler(async event => { const token = getCookie(event, SESSION_COOKIE); if (!token || !validateSession(token)) throw createError({ statusCode: 401, statusMessage: '未授权' }); try { return { success: true, item: saveDeliveryItem(await readBody(event)) } } catch (e: any) { throw createError({ statusCode: 400, statusMessage: e.message || '保存失败' }) } })
