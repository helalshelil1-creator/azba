import {
  Controller, Get, Patch, Post, Query, Param, Body, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator'
import { NotificationType, NotificationChannel } from '@prisma/client'

class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  message: string

  @IsOptional()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[]
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'إشعاراتي' })
  getMine(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: boolean,
  ) {
    return this.notifications.getMine(userId, { page, limit, unreadOnly })
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'تعليم كمقروء' })
  markAsRead(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.markAsRead(userId, id)
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'تعليم الكل كمقروء' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notifications.markAllAsRead(userId)
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'إحصائيات الإشعارات' })
  getStats() {
    return this.notifications.getStats()
  }

  @Post('send')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'إرسال إشعار' })
  send(@Body() dto: CreateNotificationDto, @CurrentUser('id') userId: string) {
    return this.notifications.create({ ...dto, userId })
  }
}
