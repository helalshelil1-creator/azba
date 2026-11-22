import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { InvestmentsModule } from './modules/investments/investments.module'
import { FarmsModule } from './modules/farms/farms.module'
import { AnimalsModule } from './modules/animals/animals.module'
import { FinancialModule } from './modules/financial/financial.module'
import { AdminModule } from './modules/admin/admin.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { SupportModule } from './modules/support/support.module'
import { HealthController } from './health.controller'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    InvestmentsModule,
    FarmsModule,
    AnimalsModule,
    FinancialModule,
    AdminModule,
    NotificationsModule,
    SupportModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
