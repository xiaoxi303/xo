import { H3Event } from 'h3'
import nodemailer from 'nodemailer'
import { dbGetSiteConfig, dbGetProjectsRaw } from './db'

export function extractEmail(contact: string): string | null {
  if (!contact) return null
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  const matches = contact.match(emailRegex)
  return matches ? matches[0] : null
}

export async function sendApprovalEmail(event: H3Event, request: any): Promise<boolean> {
  try {
    const config = await dbGetSiteConfig(event)
    const emailSettings = config?.emailSettings

    if (!emailSettings || !emailSettings.enabled) {
      console.log('Email notifications are disabled in site configuration.')
      return false
    }

    const toEmail = extractEmail(request.contact)
    if (!toEmail) {
      console.log(`No valid email address found in request contact: "${request.contact}"`)
      return false
    }

    // Retrieve project password
    const projects = await dbGetProjectsRaw(event)
    const project = projects.find(p => p.slug === request.projectSlug)
    const password = project ? project.password : ''

    const host = getHeader(event, 'host') || 'localhost:3000'
    const protocol = getHeader(event, 'x-forwarded-proto') || 'http'
    const projectUrl = `${protocol}://${host}/projects/${request.projectSlug}`

    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: Number(emailSettings.smtpPort) || 465,
      secure: emailSettings.smtpSecure !== false,
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPass
      }
    })

    const senderName = emailSettings.senderName || 'Xo Studio'
    const subject = `【${senderName}】您申请的作品《${request.projectTitle}》授权已通过`

    // High-end luxury styled HTML template matching the website theme
    const html = `
      <div style="background-color: #fbfbfa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; color: #2d2f34;">
        <div style="max-w: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02); overflow: hidden; text-align: left;">
          
          <!-- Header -->
          <div style="background-color: #121316; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: normal; letter-spacing: 0.05em;">Xo Studio</h1>
            <p style="color: #b45309; margin: 5px 0 0 0; font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em;">Exclusive Clip Authorization</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 14px; line-height: 1.6; margin-top: 0; color: #52525b;">您好，</p>
            <p style="font-size: 14px; line-height: 1.6; color: #2d2f34;">您申请观摩的作品 <b>《${request.projectTitle}》</b> 授权申请已通过审核，访问密码及直接观看入口如下：</p>
            
            <!-- Password Display Box -->
            <div style="background-color: #fcf6e8; border: 1px dashed rgba(180, 83, 9, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #b45309; display: block; margin-bottom: 5px;">作品访问密码</span>
              <strong style="font-size: 24px; font-family: monospace; color: #121316; letter-spacing: 0.05em;">${password || '公开访问（无密码）'}</strong>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0 10px 0;">
              <a href="${projectUrl}" target="_blank" style="background-color: #b45309; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 30px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.2); transition: background-color 0.2s;">
                立即访问作品页
              </a>
            </div>

            <p style="font-size: 11px; line-height: 1.6; color: #a1a1aa; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center;">
              本邮件由 Xo Studio 系统自动发送，请勿直接回复。<br>
              如有疑问，请通过微信号或网站公布的联系邮箱联系主理人。
            </p>
          </div>

        </div>
        <p style="font-size: 10px; color: #a1a1aa; margin-top: 20px; text-align: center; font-family: monospace;">
          © ${new Date().getFullYear()} Xo Studio · All rights reserved
        </p>
      </div>
    `

    await transporter.sendMail({
      from: `"${senderName}" <${emailSettings.smtpUser}>`,
      to: toEmail,
      subject,
      html
    })

    console.log(`Successfully sent approval email to: ${toEmail} for project: ${request.projectTitle}`)
    return true
  } catch (error) {
    console.error('Failed to send approval email:', error)
    return false
  }
}
