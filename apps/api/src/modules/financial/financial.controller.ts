import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { FinancialService } from './financial.service'
import {
  CreateJournalEntryDto, CreateAccountDto, UpdateAccountDto,
  CreateExpenseDto, UpdateExpenseDto, ExpenseApprovalDto, CreateDistributionDto,
} from './dto/financial.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('financial')
@ApiBearerAuth()
@Controller('financial')
export class FinancialController {
  constructor(private readonly financial: FinancialService) {}

  // ---------- Chart of Accounts ----------
  @Get('accounts')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'شجرة الحسابات' })
  getAccounts() {
    return this.financial.findAllAccounts()
  }

  @Post('accounts')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'إنشاء حساب' })
  createAccount(@Body() dto: CreateAccountDto) {
    return this.financial.createAccount(dto)
  }

  @Get('accounts/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'حساب' })
  getAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.financial.findAccount(id)
  }

  @Patch('accounts/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'تحديث حساب' })
  updateAccount(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAccountDto) {
    return this.financial.updateAccount(id, dto)
  }

  @Delete('accounts/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'تعطيل حساب' })
  deactivateAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.financial.deactivateAccount(id)
  }

  // ---------- Journal Entries ----------
  @Get('journal-entries')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'قيود اليومية' })
  getJournalEntries(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('accountId') accountId?: string,
  ) {
    return this.financial.findAllJournalEntries({ page, limit, from, to, accountId })
  }

  @Post('journal-entries')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'إنشاء قيد يومية' })
  createJournalEntry(@Body() dto: CreateJournalEntryDto, @CurrentUser('id') userId: string) {
    return this.financial.createJournalEntry(dto, userId)
  }

  @Get('journal-entries/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'قيد يومية' })
  getJournalEntry(@Param('id', ParseUUIDPipe) id: string) {
    return this.financial.findJournalEntry(id)
  }

  @Post('journal-entries/:id/reverse')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'عكس قيد' })
  reverseJournalEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.financial.reverseJournalEntry(id, userId, reason)
  }

  // ---------- Expenses ----------
  @Get('expenses')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'FARM_MANAGER')
  @ApiOperation({ summary: 'المصروفات' })
  getExpenses(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.financial.findAllExpenses({ page, limit, projectId, category, status })
  }

  @Post('expenses')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'FARM_MANAGER')
  @ApiOperation({ summary: 'تسجيل مصروف' })
  createExpense(@Body() dto: CreateExpenseDto, @CurrentUser('id') userId: string) {
    return this.financial.createExpense(dto, userId)
  }

  @Patch('expenses/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'تحديث مصروف' })
  updateExpense(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateExpenseDto) {
    return this.financial.updateExpense(id, dto)
  }

  @Post('expenses/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'اعتماد / رفض مصروف' })
  approveExpense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExpenseApprovalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.financial.approveExpense(id, dto, userId)
  }

  // ---------- Reports ----------
  @Get('reports/trial-balance')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'ميزان المراجعة' })
  getTrialBalance() {
    return this.financial.getTrialBalance()
  }

  @Get('reports/profit-loss')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'ACCOUNTANT', 'INVESTMENT_MANAGER')
  @ApiOperation({ summary: 'الأرباح والخسائر' })
  getProfitLoss(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.financial.getProfitLoss({ from, to, projectId })
  }

  // ---------- Distributions ----------
  @Get('distributions')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'INVESTMENT_MANAGER')
  @ApiOperation({ summary: 'التوزيعات' })
  getDistributions(@Query('projectId') projectId?: string) {
    return this.financial.getDistributions(projectId)
  }

  @Post('distributions')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'حساب توزيع' })
  createDistribution(@Body() dto: CreateDistributionDto, @CurrentUser('id') userId: string) {
    return this.financial.createDistribution(dto, userId)
  }

  @Post('distributions/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'اعتماد توزيع' })
  approveDistribution(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.financial.approveDistribution(id, userId)
  }

  @Post('distributions/:id/execute')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'تنفيذ توزيع' })
  executeDistribution(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.financial.executeDistribution(id, userId)
  }
}
