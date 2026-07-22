import { recordProjectClickEvent } from '~/utils/analytics'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  router.afterEach((to) => {
    // Automatically track project click on EVERY route navigation to /projects/[slug]
    if (to.path && to.path.startsWith('/projects/') && to.path !== '/projects') {
      const rawSlug = to.path.replace(/^\/projects\//, '').split('/')[0].split('?')[0]
      if (rawSlug && rawSlug !== 'projects') {
        recordProjectClickEvent(rawSlug)
      }
    }
  })
})
