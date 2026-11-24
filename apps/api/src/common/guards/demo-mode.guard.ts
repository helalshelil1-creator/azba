import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

/**
 * وضع النسخة التجريبية (DEMO_MODE=1): يمنع أي عملية تُنشئ التزامًا ماليًا أو
 * تحرّك أموالًا (حجز/تأكيد استثمار، سحب، تنفيذ توزيع أرباح). القراءة وبقية
 * الوظائف لا تتأثر. بدون DEMO_MODE=1 لا يغيّر الحارس أي سلوك.
 */
const BLOCKED: RegExp[] = [
  /\/investments\/reservations\/?$/,
  /\/investments\/confirm\/?$/,
  /\/investments\/wallet\/withdraw\/?$/,
  /\/financial\/distributions\/[^/]+\/execute\/?$/,
]

@Injectable()
export class DemoModeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (process.env.DEMO_MODE !== '1') return true
    const req = context.switchToHttp().getRequest()
    if (req.method !== 'POST') return true
    const path: string = String(req.originalUrl || req.url || '').split('?')[0]
    if (BLOCKED.some((re) => re.test(path))) {
      throw new ForbiddenException('هذه نسخة تجريبية: لا يمكن إنشاء استثمار أو دفع أو سحب أموال.')
    }
    return true
  }
}
