import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  // Security
  app.use(helmet())
  app.use(compression())
  app.use(cookieParser())

  // CORS
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Accept-Language', 'x-azba-route'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  })

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  )

  // Global prefix
  const globalPrefix = process.env.API_PREFIX || 'api'
  app.setGlobalPrefix(globalPrefix, { exclude: ['health'] })

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AZBA | عزبة API')
      .setDescription('منصة الاستثمار والإدارة في الثروة الحيوانية')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'المصادقة والتسجيل')
      .addTag('users', 'إدارة المستخدمين')
      .addTag('projects', 'المشاريع الاستثمارية')
      .addTag('investments', 'الاستثمارات والأسهم')
      .addTag('farms', 'إدارة المزارع')
      .addTag('animals', 'إدارة الحيوانات')
      .addTag('financial', 'المالية والمحاسبة')
      .addTag('admin', 'لوحة الإدارة')
      .addTag('notifications', 'الإشعارات')
      .addTag('support', 'الدعم الفني')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: 'AZBA API Docs',
    })
  }

  const port = parseInt(process.env.PORT || '4000', 10)
  await app.listen(port, '0.0.0.0')
  Logger.log(`🚀 AZBA API running on http://localhost:${port}/${globalPrefix}`, 'Bootstrap')
  Logger.log(`📚 Swagger docs at http://localhost:${port}/docs`, 'Bootstrap')
}

bootstrap()
