import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

/**
 * إرسال بريد عبر SMTP. يعمل فقط إذا ضُبطت SMTP_HOST (و SMTP_FROM).
 * بدونها لا يُرسل شيء ويُسجَّل تحذير (لا نحدد مزود خدمة بدل صاحب المشروع).
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')
    if (host) {
      const port = parseInt(this.config.get<string>('SMTP_PORT') || '587', 10)
      const user = this.config.get<string>('SMTP_USER')
      const pass = this.config.get<string>('SMTP_PASS')
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        ...(user && pass ? { auth: { user, pass } } : {}),
      })
    }
  }

  get enabled() {
    return !!this.transporter
  }

  async send(to: string, subject: string, text: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('SMTP غير مضبوط: لم يُرسل البريد')
      return false
    }
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER'),
        to,
        subject,
        text,
      })
      return true
    } catch (err) {
      this.logger.error(`فشل إرسال البريد: ${(err as Error).message}`)
      return false
    }
  }
}
