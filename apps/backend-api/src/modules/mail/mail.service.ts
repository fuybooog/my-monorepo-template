import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { Transporter } from 'nodemailer'

/**
 * 邮件发送服务：基于 nodemailer 的 SMTP 封装
 *
 * 配置项（写入 .env / .env.development / .env.example）：
 * - MAIL_HOST   SMTP 服务器地址，如 smtp.qq.com
 * - MAIL_PORT   SMTP 端口，QQ/163 等常用 465（SSL）或 587（STARTTLS）
 * - MAIL_SECURE 是否使用 SSL（465 端口为 true，587 为 false）
 * - MAIL_USER   发件邮箱账号，如 xxx@qq.com
 * - MAIL_PASS   发件邮箱 SMTP 授权码（非登录密码，需在邮箱设置中开启 SMTP 后生成）
 * - MAIL_FROM   发件人显示名称（可选，默认「系统管理员」）
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private readonly transporter: Transporter

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get<string>('MAIL_PORT') ?? 465),
      secure: (this.configService.get<string>('MAIL_SECURE') ?? 'true') === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    })
  }

  /**
   * 发送找回密码验证码邮件
   */
  async sendVerificationCode(to: string, code: string): Promise<void> {
    const fromName = this.configService.get<string>('MAIL_FROM') || '系统管理员'
    const fromAddr = this.configService.get<string>('MAIL_USER') || ''
    await this.transporter.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to,
      subject: '【找回密码】邮箱验证码',
      text: `您的邮箱验证码为：${code}，10 分钟内有效。如非本人操作，请忽略本邮件。`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="margin: 0 0 16px; color: #1f2937;">找回密码</h2>
          <p style="margin: 0 0 16px; color: #4b5563; line-height: 1.6;">您正在申请重置登录密码，请输入以下验证码完成操作：</p>
          <div style="padding: 12px 0; font-size: 28px; font-weight: 700; letter-spacing: 8px; text-align: center; color: #1677ff; background: #f0f5ff; border-radius: 6px;">${code}</div>
          <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">验证码 10 分钟内有效，且仅可使用一次。如非本人操作请忽略本邮件。</p>
        </div>
      `,
    })
    this.logger.log(`验证码邮件已发送至 ${to}`)
  }
}
