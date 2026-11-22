import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { InvestmentsService } from './investments.service'
import {
  CreateReservationDto, ConfirmInvestmentDto, WithdrawalDto, InvestmentQueryDto,
} from './dto/investment.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('investments')
@ApiBearerAuth()
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investments: InvestmentsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'لوحة المستثمر' })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.investments.getDashboard(userId)
  }

  @Get()
  @ApiOperation({ summary: 'استثمارات المستثمر' })
  findMine(@CurrentUser('id') userId: string, @Query() query: InvestmentQueryDto) {
    return this.investments.getInvestments(userId, query)
  }

  @Get('wallet')
  @ApiOperation({ summary: 'محفظة المستثمر' })
  getWallet(@CurrentUser('id') userId: string) {
    return this.investments.getWallet(userId)
  }

  @Get('wallet/transactions')
  @ApiOperation({ summary: 'حركات المحفظة' })
  getWalletTransactions(@CurrentUser('id') userId: string, @Query() query: InvestmentQueryDto) {
    return this.investments.getWalletTransactions(userId, query)
  }

  @Post('wallet/withdraw')
  @ApiOperation({ summary: 'طلب سحب' })
  requestWithdrawal(@CurrentUser('id') userId: string, @Body() dto: WithdrawalDto) {
    return this.investments.requestWithdrawal(userId, dto)
  }

  @Get('reservations')
  @ApiOperation({ summary: 'حجوزاتي' })
  getReservations(@CurrentUser('id') userId: string) {
    return this.investments.getReservations(userId)
  }

  @Post('reservations')
  @ApiOperation({ summary: 'حجز أسهم' })
  createReservation(@CurrentUser('id') userId: string, @Body() dto: CreateReservationDto) {
    return this.investments.createReservation(userId, dto)
  }

  @Delete('reservations/:id')
  @ApiOperation({ summary: 'إلغاء حجز' })
  cancelReservation(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.investments.cancelReservation(userId, id)
  }

  @Post('confirm')
  @ApiOperation({ summary: 'تأكيد استثمار' })
  confirm(@CurrentUser('id') userId: string, @Body() dto: ConfirmInvestmentDto) {
    return this.investments.confirmInvestment(userId, dto)
  }

  // ---------- Admin ----------
  @Get('admin/all')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE_MANAGER', 'INVESTMENT_MANAGER')
  @ApiOperation({ summary: 'كل الاستثمارات (إدارة)' })
  findAll(@Query() query: InvestmentQueryDto) {
    return this.investments.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل استثمار' })
  findOne(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.investments.getInvestment(userId, id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'إلغاء استثمار' })
  cancel(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.investments.cancelInvestment(userId, id)
  }

}
