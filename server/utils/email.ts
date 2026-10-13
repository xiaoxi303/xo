import { H3Event } from 'h3'
import nodemailer from 'nodemailer'
import fs from 'node:fs'
import path from 'node:path'
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

    if (process.env.XO_EMAIL_ENABLED === 'false' || !emailSettings || !emailSettings.enabled) {
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
    // Use dynamic password for auto-rotate projects
    let password = project ? (project.password || '') : ''
    if (project && project.autoRotatePassword && project.slug) {
      const { getDailyPassword } = await import('./password-utils')
      password = getDailyPassword(project.slug)
    }

    const siteUrl = (config?.siteInfo?.siteUrl || 'https://xo.xoxox.bond').replace(/\/$/, '')
    const projectUrl = `${siteUrl}/projects/${request.projectSlug}`
    const logoImgSrc = `${siteUrl}/logo.png?v=312k_v4`

    const smtpPass = process.env.SMTP_PASS || emailSettings.smtpPass
    if (!smtpPass) return false
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: Number(emailSettings.smtpPort) || 465,
      secure: emailSettings.smtpSecure !== false,
      auth: {
        user: emailSettings.smtpUser,
        pass: smtpPass
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
            <!-- Brand Logo (logo.png) -->
            <img src="${logoImgSrc}" alt="Xo Logo" style="height: 52px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 12px auto; display: block;" />
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

export async function sendVerificationCodeEmail(
  event: H3Event,
  options: { toEmail: string; code: string }
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = await dbGetSiteConfig(event)
    const emailSettings = config?.emailSettings

    if (!emailSettings || !emailSettings.enabled) {
      return { success: false, message: '系统未开启邮件通知功能，请联系管理员配置。' }
    }

    const smtpPass = process.env.SMTP_PASS || emailSettings.smtpPass
    if (!emailSettings.smtpHost || !emailSettings.smtpUser || !smtpPass) {
      return { success: false, message: '系统 SMTP 发件参数未配置完整，请联系管理员。' }
    }

    const { toEmail, code } = options
    if (!toEmail || !toEmail.includes('@')) {
      return { success: false, message: '无效的电子邮箱地址。' }
    }

    const siteUrl = (config?.siteInfo?.siteUrl || 'https://xo.xoxox.bond').replace(/\/$/, '')
    const logoImgSrc = `${siteUrl}/logo.png?v=312k_v4`
    const senderName = emailSettings.senderName || 'Xo Studio'
    const subject = `【${senderName}】注册验证码：${code}`

    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: Number(emailSettings.smtpPort) || 465,
      secure: emailSettings.smtpSecure !== false,
      auth: {
        user: emailSettings.smtpUser,
        pass: smtpPass
      }
    })

    const html = `
      <div style="background-color: #f7f6f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 50px 20px; color: #2d2f34; line-height: 1.6;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e9e8e3; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.035); overflow: hidden;">
          
          <!-- Top Accent Gold Line -->
          <div style="height: 6px; background: linear-gradient(90deg, #d97706, #b45309, #d97706);"></div>
          
          <!-- Header Area -->
          <div style="padding: 35px 40px 25px 40px; text-align: center; border-bottom: 1px solid #f3f2ee;">
            <img src="${logoImgSrc}" alt="${senderName} Logo" style="height: 52px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 12px auto; display: block;" />
            <h1 style="color: #121316; margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: normal; letter-spacing: 0.08em; line-height: 1.2; text-transform: uppercase;">${senderName}</h1>
            <p style="color: #b45309; margin: 6px 0 0 0; font-family: monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: bold;">Account Registration Verification</p>
            <div style="width: 24px; height: 1.5px; background-color: #b45309; margin: 18px auto 0 auto; opacity: 0.6;"></div>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 40px;">
            <p style="font-size: 15px; margin-top: 0; color: #121316; font-weight: 600;">尊敬的用户：</p>
            <p style="font-size: 14px; color: #5e6066; margin-bottom: 24px; line-height: 1.7;">
              您正在注册 <strong>${senderName}</strong> 客户控制中心账号。请在注册页面中输入下方 6 位数字验证码以完成身份验证：
            </p>
            
            <!-- Code Ticket Card -->
            <div style="background: #fdfbf7; border: 1.5px dashed #d97706; border-radius: 16px; padding: 28px 24px; text-align: center; margin: 28px 0; box-shadow: 0 4px 14px rgba(180, 83, 9, 0.03);">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: #b45309; font-weight: bold; display: block; margin-bottom: 10px;">注册验证码 / VERIFICATION CODE</span>
              <strong style="font-size: 34px; font-family: 'Courier New', Courier, monospace; color: #121316; letter-spacing: 0.28em; display: inline-block; padding-left: 0.28em;">${code}</strong>
              <div style="margin-top: 12px; font-size: 11px; color: #b45309; font-weight: 500;">
                ⏱️ 验证码有效期为 <strong>60 秒</strong>，请尽快使用
              </div>
            </div>

            <!-- Security Tip -->
            <div style="background-color: #fcfcfa; border-radius: 12px; padding: 16px 20px; border: 1px solid #efeee9; margin-top: 24px;">
              <p style="font-size: 12px; color: #8c8e94; margin: 0; line-height: 1.6;">
                🔒 <strong>安全提示：</strong>如果这不是您本人的操作，请忽略本邮件，您的账号安全不会受任何影响。请勿将此验证码泄漏给他人。
              </p>
            </div>

            <!-- Footer note -->
            <div style="margin-top: 35px; border-top: 1px solid #f3f2ee; padding-top: 20px; text-align: center;">
              <p style="font-size: 11px; line-height: 1.6; color: #a1a3a8; margin: 0;">
                本邮件由 ${senderName} 系统自动发出，请勿直接回复。<br>
                如有疑问，请通过官方网站公布的联系方式与管理员取得联系。
              </p>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div style="background-color: #121316; padding: 20px; text-align: center;">
            <p style="font-size: 9px; color: #8c8e94; margin: 0; font-family: monospace; text-transform: uppercase; letter-spacing: 0.12em;">
              © ${new Date().getFullYear()} ${senderName} · All rights reserved
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

    console.log(`Successfully sent verification code email to: ${toEmail}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to send verification code email:', error)
    return { success: false, message: error.message || '邮件发送失败，请稍后重试。' }
  }
}

export async function sendDeliveryCredentialsEmail(
  event: H3Event,
  options: {
    toEmail: string
    clientName: string
    company?: string
    deliverySuffix: string
    deliveryKey: string
    serviceType?: string
    description?: string
  }
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = await dbGetSiteConfig(event)
    const emailSettings = config?.emailSettings

    if (!emailSettings || !emailSettings.enabled) {
      return { success: false, message: '系统未开启邮件通知功能，请在后台设置中启用 SMTP 邮件通知。' }
    }

    const smtpPass = process.env.SMTP_PASS || emailSettings.smtpPass
    if (!emailSettings.smtpHost || !emailSettings.smtpUser || !smtpPass) {
      return { success: false, message: '系统 SMTP 发件参数未配置完整，请先配置 SMTP 账号与授权码。' }
    }

    const { toEmail, clientName, company, deliverySuffix, deliveryKey, serviceType, description } = options
    if (!toEmail || !toEmail.includes('@')) {
      return { success: false, message: '无效的电子邮箱地址。' }
    }

    const siteUrl = (config?.siteInfo?.siteUrl || 'https://xo.xoxox.bond').replace(/\/$/, '')
    const deliveryUrl = `${siteUrl}/delivery/${deliverySuffix}`
    const logoImgSrc = `${siteUrl}/logo.png?v=312k_v4`
    const senderName = emailSettings.senderName || 'Xo Studio'
    const subject = `【${senderName}】您的专属母带交付放映室凭证已就绪 (${clientName}${company ? ` · ${company}` : ''})`

    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: Number(emailSettings.smtpPort) || 465,
      secure: emailSettings.smtpSecure !== false,
      auth: {
        user: emailSettings.smtpUser,
        pass: smtpPass
      }
    })

    const serviceNameMap: Record<string, string> = {
      tvc: '商业 TVC 广告后期',
      color: '电影 / 纪录片调色',
      short: '社交短视频制作',
      audio: '音效 / 配乐设计',
      other: '定制影视合作'
    }
    const serviceTitle = (serviceType && serviceNameMap[serviceType]) || serviceType || '专属项目制作交付'

    const html = `
      <div style="background-color: #0b0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 50px 20px; color: #e2e8f0; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #121316; border-radius: 24px; border: 1px solid rgba(217, 119, 6, 0.25); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); overflow: hidden;">
          
          <!-- Top Accent Gold / Amber Line -->
          <div style="height: 6px; background: linear-gradient(90deg, #d97706, #f59e0b, #b45309);"></div>
          
          <!-- Brand Header -->
          <div style="padding: 36px 40px 24px 40px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: radial-gradient(ellipse at top, rgba(217,119,6,0.15) 0%, rgba(18,19,22,0) 70%);">
            <img src="${logoImgSrc}" alt="${senderName} Logo" style="height: 48px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 12px auto; display: block;" />
            <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: normal; letter-spacing: 0.1em; line-height: 1.2; text-transform: uppercase;">${senderName}</h1>
            <p style="color: #f59e0b; margin: 6px 0 0 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: bold;">Exclusive Cinema Delivery Suite</p>
            <div style="width: 32px; height: 1.5px; background: linear-gradient(90deg, #d97706, #f59e0b); margin: 16px auto 0 auto;"></div>
          </div>

          <!-- Body Content -->
          <div style="padding: 36px 40px;">
            <p style="font-size: 16px; margin-top: 0; color: #ffffff; font-weight: 600;">尊敬的 ${clientName} 老师：</p>
            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px; line-height: 1.7;">
              您在 <strong>${senderName}</strong> 的定制影视项目已生成专属母带交付放映室。放映室支持 DCI-P3 / HDR 电影级标准检视，相关交付地址与提取密钥如下：
            </p>
            
            <!-- Metadata Info list -->
            <div style="background-color: rgba(255, 255, 255, 0.03); border-radius: 16px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 26px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding: 6px 0; width: 28%;">项目客户</td>
                  <td style="color: #f8fafc; padding: 6px 0; font-weight: 600;">${clientName}${company ? ` · ${company}` : ''}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">交付服务</td>
                  <td style="color: #f59e0b; padding: 6px 0; font-weight: 600;">${serviceTitle}</td>
                </tr>
                ${description ? `
                <tr>
                  <td style="color: #64748b; padding: 6px 0; vertical-align: top;">需求简要</td>
                  <td style="color: #cbd5e1; padding: 6px 0; font-size: 12px; line-height: 1.5;">${description.slice(0, 100)}${description.length > 100 ? '...' : ''}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">放映室状态</td>
                  <td style="color: #10b981; padding: 6px 0; font-weight: bold;">🟢 专属节点已就绪 (Active)</td>
                </tr>
              </table>
            </div>

            <!-- Ticket Card for Delivery Key -->
            <div style="background: rgba(217, 119, 6, 0.06); border: 1.5px dashed rgba(245, 158, 11, 0.5); border-radius: 18px; padding: 26px 20px; text-align: center; margin: 26px 0;">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #f59e0b; font-weight: bold; display: block; margin-bottom: 10px;">
                🔑 专属提取密钥 / EXTRACTION SECRET KEY
              </span>
              <strong style="font-size: 26px; font-family: 'Courier New', Courier, monospace; color: #ffffff; letter-spacing: 0.15em; word-break: break-all; display: inline-block;">
                ${deliveryKey || '（请使用您的注册账户登录查看）'}
              </strong>
              <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
                ⚠️ 提取密钥为机密凭证，用于解锁您的专属母带播放与下载权限
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0 20px 0;">
              <a href="${deliveryUrl}" target="_blank" style="background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 15px 44px; border-radius: 14px; display: inline-block; box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35); letter-spacing: 0.06em;">
                进入专属交付放映室 &rarr;
              </a>
              <div style="margin-top: 14px; font-size: 11px; color: #64748b; font-family: monospace;">
                直接访问链接: <a href="${deliveryUrl}" style="color: #f59e0b; text-decoration: underline;">${deliveryUrl}</a>
              </div>
            </div>

            <!-- Client Account Tip -->
            <div style="background-color: rgba(16, 185, 129, 0.06); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(16, 185, 129, 0.15); margin-top: 26px;">
              <p style="font-size: 12px; color: #a7f3d0; margin: 0; line-height: 1.6;">
                💡 <strong>温馨提示：</strong>如果您已在本平台注册或登录了客户账号（邮箱与本邮箱一致），登录后在【客户控制中心】即可随时直接查看此放映室地址与密钥，无需重复查找邮件。
              </p>
            </div>

            <!-- Footer note -->
            <div style="margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 22px; text-align: center;">
              <p style="font-size: 11px; line-height: 1.6; color: #64748b; margin: 0;">
                本邮件由 ${senderName} 交付系统自动发出，请勿直接回复。<br>
                如需技术协助或调整排期，请通过官方微信或主理人电话直接联系。
              </p>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div style="background-color: #0b0c0e; padding: 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <p style="font-size: 9px; color: #64748b; margin: 0; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em;">
              © ${new Date().getFullYear()} ${senderName} · DCI MASTER CINEMA SUITE
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

    console.log(`Successfully sent delivery credentials email to: ${toEmail} for suffix: ${deliverySuffix}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to send delivery credentials email:', error)
    return { success: false, message: error.message || '邮件发送失败，请检查 SMTP 配置。' }
  }
}

export async function sendBookingOrderPaymentEmail(
  event: H3Event,
  options: {
    toEmail: string
    clientName: string
    company?: string
    orderSuffix: string
    subject: string
    amount: string
    description?: string
    bookingId?: string
  }
): Promise<{ success: boolean; message?: string }> {
  try {
    const config = await dbGetSiteConfig(event)
    const emailSettings = config?.emailSettings

    if (!emailSettings || !emailSettings.enabled) {
      return { success: false, message: '系统未开启邮件通知功能，请在后台设置中启用 SMTP 邮件通知。' }
    }

    const smtpPass = process.env.SMTP_PASS || emailSettings.smtpPass
    if (!emailSettings.smtpHost || !emailSettings.smtpUser || !smtpPass) {
      return { success: false, message: '系统 SMTP 发件参数未配置完整，请先配置 SMTP 账号与授权码。' }
    }

    const { toEmail, clientName, company, orderSuffix, subject, amount, description } = options
    if (!toEmail || !toEmail.includes('@')) {
      return { success: false, message: '无效的电子邮箱地址。' }
    }

    const siteUrl = (config?.siteInfo?.siteUrl || 'https://xo.xoxox.bond').replace(/\/$/, '')
    const orderUrl = `${siteUrl}/order/${orderSuffix}`
    const logoImgSrc = `${siteUrl}/logo.png?v=312k_v4`
    const senderName = emailSettings.senderName || 'Xo Studio'
    const emailSubject = `【${senderName}】项目账单与支付结算通知 — ¥${amount} (${subject})`

    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: Number(emailSettings.smtpPort) || 465,
      secure: emailSettings.smtpSecure !== false,
      auth: {
        user: emailSettings.smtpUser,
        pass: smtpPass
      }
    })

    const html = `
      <div style="background-color: #0b0c0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; padding: 50px 20px; color: #e2e8f0; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #121316; border-radius: 24px; border: 1px solid rgba(217, 119, 6, 0.3); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); overflow: hidden;">
          
          <!-- Top Amber Accent Line -->
          <div style="height: 6px; background: linear-gradient(90deg, #d97706, #f59e0b, #b45309);"></div>
          
          <!-- Header Area -->
          <div style="padding: 36px 40px 24px 40px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: radial-gradient(ellipse at top, rgba(217,119,6,0.18) 0%, rgba(18,19,22,0) 70%);">
            <img src="${logoImgSrc}" alt="${senderName} Logo" style="height: 48px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 12px auto; display: block;" />
            <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: normal; letter-spacing: 0.1em; line-height: 1.2; text-transform: uppercase;">${senderName}</h1>
            <p style="color: #f59e0b; margin: 6px 0 0 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; font-weight: bold;">Official Cinematic Invoice & Checkout</p>
            <div style="width: 32px; height: 1.5px; background: linear-gradient(90deg, #d97706, #f59e0b); margin: 16px auto 0 auto;"></div>
          </div>

          <!-- Body Content -->
          <div style="padding: 36px 40px;">
            <p style="font-size: 16px; margin-top: 0; color: #ffffff; font-weight: 600;">尊敬的 ${clientName} 老师：</p>
            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px; line-height: 1.7;">
              感谢您对 <strong>${senderName}</strong> 的信任。我们已就您的合作需求生成了专属项目结算账单，支持支付宝 RSA-OAEP-256 安全直连付款。详情如下：
            </p>
            
            <!-- Amount Card -->
            <div style="background: rgba(217, 119, 6, 0.08); border: 1.5px dashed rgba(245, 158, 11, 0.6); border-radius: 20px; padding: 26px 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #f59e0b; font-weight: bold; display: block; margin-bottom: 8px;">
                应付结算金额 / TOTAL AMOUNT
              </span>
              <div style="font-size: 38px; font-family: 'Courier New', Courier, monospace; color: #ffffff; font-weight: bold; letter-spacing: 0.05em; display: inline-block;">
                <span style="font-size: 22px; color: #f59e0b; margin-right: 4px;">¥</span>${amount}
              </div>
              <div style="margin-top: 6px; font-size: 12px; color: #cbd5e1; font-weight: 500;">
                款项用途：${subject}
              </div>
            </div>

            <!-- Metadata Info list -->
            <div style="background-color: rgba(255, 255, 255, 0.03); border-radius: 16px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 28px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding: 6px 0; width: 28%;">付款客户</td>
                  <td style="color: #f8fafc; padding: 6px 0; font-weight: 600;">${clientName}${company ? ` · ${company}` : ''}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">专属通道</td>
                  <td style="color: #f59e0b; padding: 6px 0; font-family: monospace;">/order/${orderSuffix}</td>
                </tr>
                ${description ? `
                <tr>
                  <td style="color: #64748b; padding: 6px 0; vertical-align: top;">结算备注</td>
                  <td style="color: #cbd5e1; padding: 6px 0; font-size: 12px; line-height: 1.5;">${description}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #64748b; padding: 6px 0;">当前状态</td>
                  <td style="color: #f59e0b; padding: 6px 0; font-weight: bold;">🟡 待支付结算 (Awaiting Payment)</td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 34px 0 20px 0;">
              <a href="${orderUrl}" target="_blank" style="background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 16px 48px; border-radius: 14px; display: inline-block; box-shadow: 0 8px 24px rgba(217, 119, 6, 0.4); letter-spacing: 0.06em;">
                立即前往完成安全付款 &rarr;
              </a>
              <div style="margin-top: 14px; font-size: 11px; color: #64748b; font-family: monospace;">
                若按钮无法点击，可复制浏览器链接: <br>
                <a href="${orderUrl}" style="color: #f59e0b; text-decoration: underline;">${orderUrl}</a>
              </div>
            </div>

            <!-- Tip -->
            <div style="background-color: rgba(16, 185, 129, 0.06); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(16, 185, 129, 0.15); margin-top: 26px;">
              <p style="font-size: 12px; color: #a7f3d0; margin: 0; line-height: 1.6;">
                ✨ <strong>温馨提示：</strong>支付完成后，系统将自动把您的预约进度更新为【已付款/制作中】，并可在客户控制中心直接查阅电子凭据与后续交付母带。
              </p>
            </div>

            <!-- Footer note -->
            <div style="margin-top: 35px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 22px; text-align: center;">
              <p style="font-size: 11px; line-height: 1.6; color: #64748b; margin: 0;">
                本邮件由 ${senderName} 结算系统自动发出，请勿直接回复。<br>
                如有对公转账或开票需求，请联系项目主理人。
              </p>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div style="background-color: #0b0c0e; padding: 20px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <p style="font-size: 9px; color: #64748b; margin: 0; font-family: monospace; text-transform: uppercase; letter-spacing: 0.15em;">
              © ${new Date().getFullYear()} ${senderName} · SECURE CHECKOUT SUITE
            </p>
          </div>

        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"${senderName}" <${emailSettings.senderEmail || emailSettings.smtpUser}>`,
      to: toEmail,
      subject: emailSubject,
      html
    })

    console.log(`Successfully sent order payment email to: ${toEmail} for order: ${orderSuffix}`)
    return { success: true }
  } catch (error: any) {
    console.error('Failed to send order payment email:', error)
    return { success: false, message: error.message || '邮件发送失败，请检查 SMTP 配置。' }
  }
}

