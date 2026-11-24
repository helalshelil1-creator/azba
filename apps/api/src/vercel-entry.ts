/**
 * دخول Vercel Serverless لواجهة AZBA API.
 * نفس AppModule المستخدم محليًا، لكن عبر Express adapter حتى يعمل داخل
 * دالة Serverless (lambda) بدل سيرفر دائم.
 *
 * يُبنى  Once per instance ثم يُعاد استخدامه بين الطلبات (cold start once).
 */
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ExpressAdapter } from '@nestjs/platform-express'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

let cached: express.Express | null = null
let pending: Promise<express.Express> | null = null

async function bootstrap(): Promise<express.Express> {
  const httpAdapter = express()
  // خلف بروكسي Vercel: بدونها يرى الـ throttler عنوان البروكسي لكل الزوار
  httpAdapter.set('trust proxy', 1)
  const app = await NestFactory.create(AppModule, new ExpressAdapter(httpAdapter), {
    logger: ['error', 'warn'],
  })

  // Security + cookies — نفس main.ts (refresh يقرأ الكوكي، فبدون cookieParser يفشل)
  app.use(helmet())
  app.use(cookieParser())

  // CORS — نفس إعداد main.ts
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Language'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  })

  // Validation — نفس إعداد main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Global prefix — نفس إعداد main.ts
  app.setGlobalPrefix(process.env.API_PREFIX || 'api', { exclude: ['health'] })

  await app.init()
  return httpAdapter
}

export function getApp(): Promise<express.Express> {
  if (cached) return Promise.resolve(cached)
  if (!pending) pending = bootstrap().then((app) => { cached = app; return app })
  return pending
}

/** دالة Vercel Serverless */
/**
 * Vercel بتعاملت مع اسم الملف `[...route]` كمعامل مفرد، فالمسارات متعددة
 * الأجزاء (مثل /api/auth/login) كانت بترجع 404 من الحافة. لذلك التطبيق
 * مضمون على مسار ثابت /api/main، والعميل بيبعت المسار الحقيقي في الهيدر
 * `x-azba-route` ونعيد بناء req.url هنا قبل تمريره لـ Nest.
 */
export default async function handler(req: express.Request, res: express.Response) {
  const app = await getApp()

  const rawUrl = typeof req.url === 'string' ? req.url : ''
  const qIndex = rawUrl.indexOf('?')
  const rawQuery = qIndex >= 0 ? rawUrl.slice(qIndex + 1) : ''

  const headerRoute = req.headers['x-azba-route']
  const target =
    typeof headerRoute === 'string' && headerRoute.startsWith('/')
      ? headerRoute
      : null

  // نزّيل أي معاملات حقّنّها Vercel بنفسها (مثل ...route=...)
  const cleanQuery = rawQuery
    .split('&')
    .filter(Boolean)
    .filter((part) => !part.startsWith('...'))
    .join('&')

  if (target) {
    req.url = (target.startsWith('/api') ? target : `/api${target}`) + (cleanQuery ? `?${cleanQuery}` : '')
  } else if (rawQuery) {
    req.url = rawUrl.slice(0, qIndex) + (cleanQuery ? `?${cleanQuery}` : '')
  }

  return app(req, res)
}
