import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto, PublishProjectDto, ProjectQueryDto } from './dto/project.dto'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'قائمة المشاريع (عامة)' })
  findAll(@Query() query: ProjectQueryDto) {
    return this.projects.findAll(query, true)
  }

  @Get('all')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'كل المشاريع (إدارة)' })
  findAllAdmin(@Query() query: ProjectQueryDto) {
    return this.projects.findAll(query, false)
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER')
  @ApiOperation({ summary: 'إحصائيات المشاريع' })
  getStats() {
    return this.projects.getStats()
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل مشروع' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.findOne(id)
  }

  @Post()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER', 'FARM_MANAGER')
  @ApiOperation({ summary: 'إنشاء مشروع' })
  create(@Body() dto: CreateProjectDto, @CurrentUser('id') userId: string) {
    return this.projects.create(dto, userId)
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER', 'FARM_MANAGER')
  @ApiOperation({ summary: 'تحديث مشروع' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projects.update(id, dto, userId)
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER')
  @ApiOperation({ summary: 'تغيير حالة مشروع' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projects.publish(id, dto, userId)
  }

  @Get(':id/financials')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'INVESTMENT_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'الماليات الخاصة بالمشروع' })
  getFinancials(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.getFinancials(id)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'حذف مشروع' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.remove(id)
  }
}
