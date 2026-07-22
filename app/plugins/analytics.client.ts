import { recordProjectClickEvent } from '~/utils/analytics'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  const trackRoute = (path: string) => {
    if (typeof window === 'undefined' || !path) return
    if (path.startsWith('/projects/') && path !== '/projects') {
      const rawSlug = path.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
      if (rawSlug && rawSlug !== 'projects') {
        recordProjectClickEvent(rawSlug)
      }
    }
  }

  // 1. Trapping on Vue Router beforeEach transition
  router.beforeEach((to) => {
    trackRoute(to.path)
  })

  // 2. Trapping on Vue Router afterEach transition
  router.afterEach((to) => {
    trackRoute(to.path)
  })

  // 3. Trapping on Nuxt page:finish lifecycle hook
  nuxtApp.hook('page:finish', () => {
    const route = useRoute()
    trackRoute(route.path)
  })
})
