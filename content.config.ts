import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md'
    }),
    about: defineCollection({
      type: 'page',
      source: 'about.md'
    })
  }
})
