import { dbGetUsers } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const username = String(query.username || '').trim().toLowerCase()
  const email = String(query.email || '').trim().toLowerCase()

  if (!username && !email) {
    return { usernameAvailable: true, emailAvailable: true }
  }

  const users = await dbGetUsers(event)
  const usernameTaken = Boolean(username) && users.some((user: any) =>
    String(user.username || '').trim().toLowerCase() === username
  )
  const emailTaken = Boolean(email) && users.some((user: any) =>
    String(user.email || '').trim().toLowerCase() === email
  )

  return {
    usernameAvailable: !usernameTaken,
    emailAvailable: !emailTaken
  }
})
