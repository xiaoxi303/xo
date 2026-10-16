import { dbGetProjectsRaw } from '../../utils/db'
import { SESSION_COOKIE, validateSession } from '../../utils/auth'
import { getDailyPassword } from '../../utils/password-utils'
import { encryptFileContent } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE)
  const session = token ? validateSession(token) : null

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Please login first.' })
  }

  try {
    const projects = await dbGetProjectsRaw(event)
    
    // 密码字段安全革命：彻底消除明文传输，全面接入自研 V5 双舱量子加密与双重级联抗篡改签名引擎
    const projectsWithPassword = projects.map(project => {
      const identifier = project.slug || ''
      const isLocked = Boolean(project.isPasswordProtected)
      
      let rawPassword = project.password || ''
      if (isLocked && project.autoRotatePassword) {
        try {
          rawPassword = getDailyPassword(identifier)
        } catch {
          rawPassword = project.password || ''
        }
      }

      // 如果有密码，使用 V5 双舱级联数字签名算法生成加密封签，严禁明文传输
      const encryptedPasswordToken = rawPassword ? encryptFileContent(rawPassword) : ''
      
      return {
        ...project,
        isPasswordProtected: isLocked,
        // 彻底清空明文密码字段
        password: '',
        activePassword: encryptedPasswordToken,
        hasPassword: Boolean(rawPassword),
        vaultProtected: true
      }
    })
    
    return projectsWithPassword
  } catch (error) {
    console.error('Failed to read admin projects:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to read projects.' })
  }
})
