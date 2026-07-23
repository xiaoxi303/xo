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
      <div style="background-color: #f7f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 50px 20px; color: #2d2f34; line-height: 1.6;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e9e8e3; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03); overflow: hidden;">
          
          <!-- Elegant Header Accent -->
          <div style="height: 6px; background: linear-gradient(90deg, #d97706, #b45309, #d97706);"></div>
          
          <div style="padding: 35px 40px 25px 40px; text-align: center; border-bottom: 1px solid #f3f2ee;">
            <!-- Brand Logo (logo2.png) -->
            <img src="${protocol}://${host}/logo2.png" alt="Xo Logo" style="height: 52px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 12px auto; display: block;" />
            <h1 style="color: #121316; margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: normal; letter-spacing: 0.08em; line-height: 1.2; text-transform: uppercase;">${senderName}</h1>
            <p style="color: #b45309; margin: 6px 0 0 0; font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: bold;">Exclusive Clip Authorization</p>
            <div style="width: 24px; height: 1.5px; background-color: #b45309; margin: 18px auto 0 auto; opacity: 0.6;"></div>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 40px;">
            <p style="font-size: 15px; margin-top: 0; color: #121316; font-weight: 600;">尊敬的访客：</p>
            <p style="font-size: 14px; color: #5e6066; margin-bottom: 24px;">您好！您申请观摩的作品已通过我们的系统授权审核。相关访问凭证如下：</p>
            
            <!-- Metadata Info list -->
            <div style="background-color: #fcfcfa; border-radius: 16px; padding: 20px; border: 1px solid #efeee9; margin-bottom: 30px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #8c8e94; padding: 6px 0; width: 30%;">申请作品</td>
                  <td style="color: #121316; padding: 6px 0; font-weight: 600;">《${request.projectTitle}》</td>
                </tr>
                <tr>
                  <td style="color: #8c8e94; padding: 6px 0;">申请通道</td>
                  <td style="color: #121316; padding: 6px 0;">${request.clientName || '外部访客申请'}</td>
                </tr>
                <tr>
                  <td style="color: #8c8e94; padding: 6px 0;">授权状态</td>
                  <td style="color: #16a34a; padding: 6px 0; font-weight: bold;">🟢 已通过 (Approved)</td>
                </tr>
              </table>
            </div>

            <!-- Password Card (Ticket design) -->
            <div style="background: #fdfbf7; border: 1.5px dashed #d97706; border-radius: 16px; padding: 30px 24px; text-align: center; margin: 30px 0; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.02);">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #b45309; font-weight: bold; display: block; margin-bottom: 12px;">作品访问密码 / PASSWORD</span>
              <strong style="font-size: 32px; font-family: 'Courier New', Courier, monospace; color: #121316; letter-spacing: 0.2em; text-shadow: 0 1px 1px rgba(0,0,0,0.05); display: inline-block; padding-left: 0.2em;">${password || '公开访问（无密码）'}</strong>
            </div>

            <!-- CTA Call to action -->
            <div style="text-align: center; margin: 35px 0 15px 0;">
              <a href="${projectUrl}" target="_blank" style="background: linear-gradient(135deg, #c27a3d, #b45309); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 14px 45px; border-radius: 12px; display: inline-block; box-shadow: 0 6px 20px rgba(180, 83, 9, 0.25); letter-spacing: 0.05em;">
                立即访问作品页 &rarr;
              </a>
            </div>

            <!-- Note / Disclaimer -->
            <div style="margin-top: 35px; border-top: 1px solid #f3f2ee; padding-top: 25px; text-align: center;">
              <p style="font-size: 11px; line-height: 1.6; color: #8c8e94; margin: 0;">
                本邮件由 Xo Studio 授权中心自动发送，请勿直接回复。<br>
                如在使用过程中遇到任何问题，请通过微信或官方网站公布的邮箱联系主理人。
              </p>
            </div>
          </div>

          <!-- Bottom Footer Area -->
          <div style="background-color: #121316; padding: 20px; text-align: center;">
            <p style="font-size: 9px; color: #8c8e94; margin: 0; font-family: monospace; text-transform: uppercase; letter-spacing: 0.12em;">
              © ${new Date().getFullYear()} Xo Studio · All rights reserved
            </p>
          </div>

        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"${senderName}" <${emailSettings.senderEmail || emailSettings.smtpUser}>`,
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
