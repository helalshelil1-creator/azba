import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { ThrottlerStorage } from '@nestjs/throttler'
import { AppModule } from '../src/app.module'
import { MailerService } from '../src/modules/auth/mailer.service'

process.env.JWT_SECRET = 'test-access-secret-0123456789-0123456789'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789-0123456789'
process.env.APP_URL = 'http://web.test'

export const mails: { to: string; subject: string; text: string }[] = []

export async function bootApp(opts: { throttle?: boolean } = {}) {
  let builder = Test.createTestingModule({ imports: [AppModule] })
  if (!opts.throttle) builder = builder.overrideProvider(ThrottlerStorage).useValue({ increment: async () => ({ totalHits: 1, timeToExpire: 60, isBlocked: false, timeToBlockExpire: 0 }) })
  const mod = await builder
    .overrideProvider(MailerService)
    .useValue({ enabled: true, send: async (to: string, subject: string, text: string) => { mails.push({ to, subject, text }); return true } })
    .compile()
  const app = mod.createNestApplication()
  app.use(cookieParser())
  app.setGlobalPrefix('api', { exclude: ['health'] })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }))
  await app.listen(0)
  const base = (await app.getUrl()).replace('[::1]', 'localhost')
  return { app, base }
}

export function client(base: string) {
  return async (method: string, path: string, opts: { token?: string; body?: any; cookie?: string } = {}) => {
    const res = await fetch(`${base}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        ...(opts.cookie ? { Cookie: opts.cookie } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
    const text = await res.text()
    let json: any = null
    try { json = text ? JSON.parse(text) : null } catch {}
    return { status: res.status, json, headers: res.headers }
  }
}

export const PASSWORD = 'StrongPass123'

export async function makeUser(prisma: PrismaClient, role: string, tag = '') {
  const email = `${role.toLowerCase()}${tag}-${randomBytes(3).toString('hex')}@test.local`
  const user = await prisma.user.create({
    data: {
      email, passwordHash: await bcrypt.hash(PASSWORD, 4),
      firstName: 'Test', lastName: role, role: role as any, status: 'ACTIVE',
      wallet: { create: { currency: 'EGP', balance: 0, locked: 0 } },
    },
  })
  return { ...user, email }
}

export async function loginAs(call: ReturnType<typeof client>, email: string) {
  const r = await call('POST', '/auth/login', { body: { email, password: PASSWORD } })
  if (r.status !== 200) throw new Error(`login failed ${r.status} ${JSON.stringify(r.json)}`)
  return r.json as { accessToken: string; refreshToken: string; user: any }
}
