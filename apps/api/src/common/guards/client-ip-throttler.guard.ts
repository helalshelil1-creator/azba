import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

/**
 * مفتاح الحد = عنوان العميل الحقيقي.
 * على Vercel الطلب يصل للدالة من وسيط داخلي (req.ip = 127.0.0.1 لكل المستخدمين)، فكان الحد مشتركًا بين الجميع.
 * Vercel يكتب x-vercel-forwarded-for / x-real-ip بنفسه ولا يمرر عناوين خارجية (منع التزوير):
 * https://vercel.com/docs/headers/request-headers
 * خارج Vercel (محليًا أو أي استضافة أخرى) لا نثق بأي هيدر من العميل ونرجع لـ req.ip.
 */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (process.env.VERCEL) {
      const h = req.headers || {}
      const raw = h['x-vercel-forwarded-for'] || h['x-real-ip']
      const first = String(Array.isArray(raw) ? raw[0] : raw || '').split(',')[0].trim()
      if (first && first.length <= 64) return first
    }
    return req.ip
  }
}
