import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('admin')
@ApiBearerAuth()
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'INVESTMENT_MANAGER')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'لوحة الإدارة' })
  getDashboard() {
    return this.admin.getDashboard()
  }

  @Get('kpis')
  @ApiOperation({ summary: 'مؤشرات الأداء' })
  getKPIs() {
    return this.admin.getKPIs()
  }

  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'سجلات التدقيق' })
  getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.admin.getAuditLogs({ page, limit, userId, action, entityType })
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'الموافقات المعلقة' })
  getPendingApprovals() {
    return this.admin.getPendingApprovals()
  }

  @Post('seed-accounts')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'إنشاء شجرة الحسابات الافتراضية' })
  seedAccounts() {
    return this.admin.seedChartOfAccounts()
  }
}
