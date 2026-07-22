import { recordProjectClickEvent } from '~/utils/analytics'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client && to.path && to.path.startsWith('/projects/') && to.path !== '/projects') {
    const rawSlug = to.path.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
    if (rawSlug && rawSlug !== 'projects') {
      recordProjectClickEvent(rawSlug)
    }
  }
})
