import { getRequestURL } from 'h3'
import { requireAdminSession } from '../utils/admin-auth'

export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname
  if (pathname === '/api/admin' || pathname.startsWith('/api/admin/')) {
    requireAdminSession(event)
  }
})
