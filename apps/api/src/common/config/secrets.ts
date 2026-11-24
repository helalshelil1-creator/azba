import { ConfigService } from '@nestjs/config'

const DEV_ACCESS = 'dev-only-access-secret-not-for-production'
const DEV_REFRESH = 'dev-only-refresh-secret-not-for-production'

function resolve(value: string | undefined, name: string, devFallback: string): string {
  const isProd = process.env.NODE_ENV === 'production'
  if (value && value.length >= 32) return value
  if (isProd) {
    throw new Error(`${name} غير مضبوط أو أقصر من 32 حرفًا. اضبطه في متغيرات البيئة قبل التشغيل.`)
  }
  return value || devFallback
}

export function getAccessSecret(config: ConfigService): string {
  return resolve(config.get<string>('JWT_SECRET'), 'JWT_SECRET', DEV_ACCESS)
}

export function getRefreshSecret(config: ConfigService): string {
  return resolve(config.get<string>('JWT_REFRESH_SECRET'), 'JWT_REFRESH_SECRET', DEV_REFRESH)
}
