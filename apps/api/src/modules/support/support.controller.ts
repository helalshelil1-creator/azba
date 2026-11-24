import {
  Controller, Get, Post, Patch, Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SupportService } from './support.service'
import { CreateTicketDto, UpdateTicketDto, AssignTicketDto, ReplyTicketDto, FeedbackDto, TicketQueryDto } from './dto/support.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'تذاكري' })
  getMine(@CurrentUser('id') userId: string, @Query() query: TicketQueryDto) {
    return this.support.getMine(userId, query)
  }

  @Get('tickets/all')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER')
  @ApiOperation({ summary: 'كل التذاكر' })
  findAll(@Query() query: TicketQueryDto) {
    return this.support.findAll(query)
  }

  @Get('tickets/stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER')
  @ApiOperation({ summary: 'إحصائيات الدعم' })
  getStats() {
    return this.support.getStats()
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'تذكرة' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.support.findOne(id, userId, role)
  }

  @Post('tickets')
  @ApiOperation({ summary: 'إنشاء تذكرة' })
  create(@Body() dto: CreateTicketDto, @CurrentUser('id') userId: string) {
    return this.support.create(userId, dto)
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'تحديث تذكرة' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.support.update(id, userId, role, dto)
  }

  @Post('tickets/:id/assign')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER')
  @ApiOperation({ summary: 'إسناد تذكرة' })
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignTicketDto) {
    return this.support.assign(id, dto)
  }

  @Post('tickets/:id/reply')
  @ApiOperation({ summary: 'رد على تذكرة' })
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyTicketDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.support.reply(id, userId, role, dto)
  }

  @Post('tickets/:id/resolve')
  @ApiOperation({ summary: 'حل تذكرة' })
  resolve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.support.resolve(id, userId, role)
  }

  @Post('tickets/:id/close')
  @ApiOperation({ summary: 'إغلاق تذكرة مع تقييم' })
  close(@Param('id', ParseUUIDPipe) id: string, @Body() dto: FeedbackDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string) {
    return this.support.close(id, userId, role, dto)
  }
}
