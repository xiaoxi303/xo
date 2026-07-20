import { dbGetProjects } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    return await dbGetProjects(event)
  } catch (error) {
    console.error('Failed to read projects:', error)
    return []
  }
})
