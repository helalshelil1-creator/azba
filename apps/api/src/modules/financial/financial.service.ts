import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateJournalEntryDto, CreateAccountDto, UpdateAccountDto,
  CreateExpenseDto, UpdateExpenseDto, ExpenseApprovalDto, CreateDistributionDto,
} from './dto/financial.dto'
import { Prisma, LedgerEntryType } from '@prisma/client'
import { randomBytes } from 'crypto'

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ---------- Chart of Accounts ----------
  async createAccount(dto: CreateAccountDto) {
    const existing = await this.prisma.ledgerAccount.findUnique({ where: { code: dto.code } })
    if (existing) throw new BadRequestException('رمز الحساب مستخدم بالفعل')
    const level = dto.parentId
      ? ((await this.prisma.ledgerAccount.findUnique({ where: { id: dto.parentId } }))?.level ?? 0) + 1
      : 1
    return this.prisma.ledgerAccount.create({
      data: { code: dto.code, name: dto.name, nameEn: dto.nameEn, type: dto.type as any, subType: dto.subType, level, parentId: dto.parentId ?? null, description: dto.description },
      include: { parent: true },
    })
  }

  async findAllAccounts() {
    return this.prisma.ledgerAccount.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      include: { children: true, parent: true },
    })
  }

  async findAccount(id: string) {
    const account = await this.prisma.ledgerAccount.findUnique({
      where: { id },
      include: { entries: { orderBy: { createdAt: 'desc' }, take: 50 } },
    })
    if (!account) throw new NotFoundException('الحساب غير موجود')
    return account
  }

  async updateAccount(id: string, dto: UpdateAccountDto) {
    const account = await this.prisma.ledgerAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException('الحساب غير موجود')
    return this.prisma.ledgerAccount.update({ where: { id }, data: { name: dto.name, nameEn: dto.nameEn, subType: dto.subType, description: dto.description, isActive: dto.isActive } })
  }

  async deactivateAccount(id: string) {
    const account = await this.prisma.ledgerAccount.findUnique({ where: { id } })
    if (!account) throw new NotFoundException('الحساب غير موجود')
    return this.prisma.ledgerAccount.update({ where: { id }, data: { isActive: false } })
  }

  // ---------- Journal Entries ----------
  async createJournalEntry(dto: CreateJournalEntryDto, userId: string) {
    // الجمع بالقروش لتفادي أخطاء الفاصلة العائمة (0.1 + 0.2)
    const cents = (t: string) => dto.entries.filter((e) => e.type === t).reduce((s, e) => s + Math.round(e.amount * 100), 0)
    const totalDebit = cents('DEBIT') / 100
    const totalCredit = cents('CREDIT') / 100

    if (cents('DEBIT') !== cents('CREDIT')) {
      throw new BadRequestException('القيد غير متوازن: إجمالي المدين يجب أن يساوي إجمالي الدائن')
    }
    if (totalDebit === 0) throw new BadRequestException('مبلغ القيد يجب أن يكون أكبر من صفر')

    // Validate accounts
    const accountIds = [...new Set(dto.entries.map((e) => e.accountId))]
    const accounts = await this.prisma.ledgerAccount.findMany({ where: { id: { in: accountIds } } })
    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('أحد الحسابات غير موجود')
    }
    if (accounts.some((a) => a.isActive === false)) {
      throw new BadRequestException('لا يمكن الترحيل على حساب غير نشط')
    }

    const entryNumber = `JE-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          entryNumber,
          date: new Date(dto.date),
          description: dto.description,
          reference: dto.reference,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          totalDebit,
          totalCredit,
          status: 'POSTED',
          postedBy: userId,
          postedAt: new Date(),
          createdBy: userId,
          entries: {
            create: dto.entries.map((e) => ({
              accountId: e.accountId,
              type: e.type as LedgerEntryType,
              amount: e.amount,
              description: e.description,
              projectId: e.projectId,
              farmId: e.farmId,
              animalId: e.animalId,
            })),
          },
        },
        include: { entries: { include: { account: true } } },
      })
      this.logger.log(`Journal entry created: ${entryNumber}`)
      return entry
    })
  }

  async findAllJournalEntries(query: { page?: number; limit?: number; from?: string; to?: string; accountId?: string }) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const where: Prisma.JournalEntryWhereInput = {}
    if (query.from || query.to) {
      where.date = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      }
    }
    if (query.accountId) {
      where.entries = { some: { accountId: query.accountId } }
    }
    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: { entries: { include: { account: { select: { code: true, name: true, type: true } } } } },
      }),
      this.prisma.journalEntry.count({ where }),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async findJournalEntry(id: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: { entries: { include: { account: true, project: { select: { name: true } }, farm: { select: { name: true } } } } },
    })
    if (!entry) throw new NotFoundException('القيد غير موجود')
    return entry
  }

  async reverseJournalEntry(id: string, userId: string, reason: string) {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } })
    if (!entry) throw new NotFoundException('القيد غير موجود')
    if (entry.status === 'REVERSED') throw new BadRequestException('القيد معكوس بالفعل')
    if (entry.referenceType === 'REVERSAL') throw new BadRequestException('لا يمكن عكس قيد عكسي')
    if (!reason) throw new BadRequestException('يجب تحديد سبب العكس')

    const reversalNumber = `REV-${randomBytes(4).toString('hex').toUpperCase()}`

    return this.prisma.$transaction(async (tx) => {
      // نحجز القيد الأصلي ذريًا قبل إنشاء العكس (يمنع عكسه مرتين بالتوازي)
      const claimed = await tx.journalEntry.updateMany({
        where: { id, status: { not: 'REVERSED' } },
        data: { status: 'REVERSED', reversedBy: userId, reversedAt: new Date(), reversalReason: reason },
      })
      if (claimed.count !== 1) throw new BadRequestException('القيد معكوس بالفعل')
      // Flip entries
      const flipped = await tx.journalEntry.create({
        data: {
          entryNumber: reversalNumber,
          date: new Date(),
          description: `عكس القيد ${entry.entryNumber}: ${reason}`,
          reference: entry.entryNumber,
          referenceType: 'REVERSAL',
          referenceId: entry.id,
          totalDebit: entry.totalDebit,
          totalCredit: entry.totalCredit,
          status: 'POSTED',
          postedBy: userId,
          postedAt: new Date(),
          createdBy: userId,
          entries: {
            create: (await tx.ledgerEntry.findMany({ where: { journalEntryId: id } })).map((le) => ({
              accountId: le.accountId,
              type: le.type === 'DEBIT' ? 'CREDIT' : 'DEBIT',
              amount: le.amount,
              description: `عكس ${le.description || ''}`,
              projectId: le.projectId,
              farmId: le.farmId,
              animalId: le.animalId,
            })),
          },
        },
        include: { entries: { include: { account: true } } },
      })
      return flipped
    })
  }

  // ---------- Expenses ----------
  async createExpense(dto: CreateExpenseDto, userId: string) {
    const totalAmount = dto.amount + (dto.vatAmount || 0)
    return this.prisma.expense.create({
      data: {
        ...dto,
        totalAmount,
        createdBy: userId,
        expenseDate: new Date(dto.expenseDate),
        paymentStatus: 'UNPAID',
      },
      include: { account: { select: { code: true, name: true } } },
    })
  }

  async findAllExpenses(query: { page?: number; limit?: number; projectId?: string; category?: string; status?: string }) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const where: Prisma.ExpenseWhereInput = {}
    if (query.projectId) where.projectId = query.projectId
    if (query.category) where.category = query.category
    if (query.status) where.paymentStatus = query.status
    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { expenseDate: 'desc' },
        include: {
          account: { select: { code: true, name: true } },
          project: { select: { name: true, code: true } },
          farm: { select: { name: true } },
        },
      }),
      this.prisma.expense.count({ where }),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async updateExpense(id: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({ where: { id } })
    if (!expense) throw new NotFoundException('المصروف غير موجود')
    if (expense.approvedAt) throw new BadRequestException('لا يمكن تعديل مصروف معتمد')
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.amount && { totalAmount: (dto.amount ?? expense.amount.toNumber()) + (dto.vatAmount ?? expense.vatAmount?.toNumber() ?? 0) }),
        ...(dto.expenseDate && { expenseDate: new Date(dto.expenseDate) }),
      },
    })
  }

  async approveExpense(id: string, dto: ExpenseApprovalDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id }, include: { account: true } })
      if (!expense) throw new NotFoundException('المصروف غير موجود')
      if (expense.approvedAt || expense.rejectedAt) throw new BadRequestException('تم البت في هذا المصروف بالفعل')

      // حجز ذري: يمنع الاعتماد المزدوج (قيد محاسبي مكرر)
      const claim = await tx.expense.updateMany({
        where: { id, approvedAt: null, rejectedAt: null },
        data: { updatedAt: new Date() },
      })
      if (claim.count !== 1) throw new BadRequestException('تم البت في هذا المصروف بالفعل')

      const updated = await tx.expense.update({
        where: { id },
        data:
          dto.action === 'APPROVED'
            ? { status: 'APPROVED', approvedBy: userId, approvedAt: new Date() }
            : { status: 'REJECTED', rejectedBy: userId, rejectedAt: new Date(), rejectionReason: dto.comment },
      })

      if (dto.action === 'APPROVED') {
        // Create journal entry: DR Expense / CR Payable
        const payableAccount = await tx.ledgerAccount.findFirst({ where: { code: { startsWith: '2' }, type: 'LIABILITY' } })
        if (payableAccount) {
          const entryNumber = `JE-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
          await tx.journalEntry.create({
            data: {
              entryNumber,
              date: new Date(),
              description: `مصروف ${expense.category} — ${expense.description || expense.id}`,
              reference: expense.invoiceNumber || expense.id,
              referenceType: 'EXPENSE',
              referenceId: expense.id,
              totalDebit: expense.totalAmount ?? expense.amount,
              totalCredit: expense.totalAmount ?? expense.amount,
              status: 'POSTED',
              postedBy: userId,
              postedAt: new Date(),
              createdBy: userId,
              entries: {
                create: [
                  { accountId: expense.accountId, type: 'DEBIT', amount: expense.totalAmount ?? expense.amount, projectId: expense.projectId, farmId: expense.farmId, animalId: expense.animalId },
                  { accountId: payableAccount.id, type: 'CREDIT', amount: expense.totalAmount ?? expense.amount, projectId: expense.projectId, farmId: expense.farmId },
                ],
              },
            },
          })
        }
      }
      return updated
    })
  }

  // ---------- Reports ----------
  async getTrialBalance() {
    const accounts = await this.prisma.ledgerAccount.findMany({
      where: { isActive: true },
      include: { entries: true },
      orderBy: { code: 'asc' },
    })
    return accounts.map((a) => {
      const debit = a.entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount.toNumber(), 0)
      const credit = a.entries.filter((e) => e.type === 'CREDIT').reduce((s, e) => s + e.amount.toNumber(), 0)
      const balance = debit - credit
      return {
        code: a.code,
        name: a.name,
        type: a.type,
        debit,
        credit,
        balance,
        normalBalance: a.type === 'ASSET' || a.type === 'EXPENSE' ? 'DEBIT' : 'CREDIT',
      }
    })
  }

  async getProfitLoss(query: { from?: string; to?: string; projectId?: string }) {
    // المصروفات المرفوضة لا تدخل في النتيجة
    const where: Prisma.ExpenseWhereInput = { rejectedAt: null }
    if (query.projectId) where.projectId = query.projectId
    if (query.from || query.to) {
      where.expenseDate = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      }
    }
    const [revenue, expenses, byCategory] = await Promise.all([
      this.prisma.sale.aggregate({
        where: {
          ...(query.projectId && { projectId: query.projectId }),
          ...(query.from || query.to
            ? { saleDate: { ...(query.from && { gte: new Date(query.from) }), ...(query.to && { lte: new Date(query.to) }) } }
            : {}),
          status: { in: ['COMPLETED', 'DELIVERED'] },
        },
        _sum: { netPrice: true },
      }),
      this.prisma.expense.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { totalAmount: true },
      }),
    ])
    const totalRevenue = revenue._sum.netPrice?.toNumber() || 0
    const totalExpenses = expenses._sum.totalAmount?.toNumber() || 0
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      byCategory: byCategory.map((c) => ({ category: c.category, amount: c._sum.totalAmount?.toNumber() || 0 })),
    }
  }

  // ---------- Distributions ----------
  async createDistribution(dto: CreateDistributionDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: dto.projectId },
        include: { investments: { where: { status: { in: ['ACTIVE', 'COMPLETED'] } } } },
      })
      if (!project) throw new NotFoundException('المشروع غير موجود')

      const revenue = await tx.sale.aggregate({
        where: { projectId: dto.projectId, status: { in: ['COMPLETED', 'DELIVERED'] } },
        _sum: { netPrice: true },
      })
      const expenses = await tx.expense.aggregate({
        where: { projectId: dto.projectId, rejectedAt: null },
        _sum: { totalAmount: true },
      })
      const totalRevenue = revenue._sum.netPrice?.toNumber() || 0
      const totalExpenses = expenses._sum.totalAmount?.toNumber() || 0
      const netProfit = Math.round((totalRevenue - totalExpenses) * 100) / 100

      if (netProfit <= 0) {
        throw new BadRequestException('لا يمكن توزيع أرباح — صافي النتيجة غير موجب')
      }

      const companyPercent = dto.companySharePercent ?? 20
      const companyShare = netProfit * (companyPercent / 100)
      const investorPool = netProfit - companyShare
      const totalShares = project.investments.reduce((s, i) => s + i.shareCount, 0)
      if (totalShares === 0) throw new BadRequestException('لا توجد استثمارات في المشروع')

      const distributionRate = investorPool / totalShares
      const distNumber = `DST-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`

      return tx.profitDistribution.create({
        data: {
          projectId: dto.projectId,
          reference: distNumber,
          distributionNumber: distNumber,
          totalAmount: investorPool,
          periodStart: new Date(dto.periodStart),
          periodEnd: new Date(dto.periodEnd),
          totalRevenue,
          totalExpenses,
          netProfit,
          companyShare,
          investorPool,
          distributionRate,
          status: 'CALCULATED',
          calculatedBy: userId,
          calculatedAt: new Date(),
          details: {
            create: project.investments.map((inv) => {
              const gross = inv.shareCount * distributionRate
              const fee = gross * 0.02
              const tax = gross * 0.05
              return {
                investmentId: inv.id,
                shareCount: inv.shareCount,
                grossAmount: gross,
                feeAmount: fee,
                taxAmount: tax,
                netAmount: gross - fee - tax,
              }
            }),
          },
        },
        include: { details: { include: { investment: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } } },
      })
    }, { maxWait: 15000, timeout: 30000 })
  }

  async approveDistribution(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const dist = await tx.profitDistribution.findUnique({ where: { id } })
      if (!dist) throw new NotFoundException('التوزيع غير موجود')
      if (dist.status !== 'CALCULATED') throw new BadRequestException('التوزيع ليس في حالة الحساب')
      const claimed = await tx.profitDistribution.updateMany({
        where: { id, status: 'CALCULATED' },
        data: { status: 'APPROVED', approvedBy: userId, approvedAt: new Date() },
      })
      if (claimed.count !== 1) throw new BadRequestException('التوزيع ليس في حالة الحساب')
      return tx.profitDistribution.findUniqueOrThrow({ where: { id } })
    })
  }

  async executeDistribution(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const dist = await tx.profitDistribution.findUnique({
        where: { id },
        include: { details: true },
      })
      if (!dist) throw new NotFoundException('التوزيع غير موجود')
      if (dist.status !== 'APPROVED') throw new BadRequestException('يجب اعتماد التوزيع أولًا')

      // حجز ذري: تنفيذ واحد فقط (يمنع دفع الأرباح مرتين)
      const claimed = await tx.profitDistribution.updateMany({
        where: { id, status: 'APPROVED' },
        data: { status: 'APPROVED', approvedAt: dist.approvedAt ?? new Date() },
      })
      if (claimed.count !== 1) throw new BadRequestException('يجب اعتماد التوزيع أولًا')

      for (const detail of dist.details) {
        if (detail.status === 'PAID') continue
        const inv = await tx.investment.findUnique({ where: { id: detail.investmentId } })
        if (!inv) continue
        const wallet = await tx.wallet.findUnique({ where: { userId: inv.userId } })
        if (!wallet) {
          throw new BadRequestException('محفظة أحد المستثمرين غير موجودة: لا يمكن إتمام التوزيع')
        }
        // لا نقفز بصمت: حجز تفصيل التوزيع قبل الدفع
        const claimDetail = await tx.profitDistributionDetail.updateMany({
          where: { id: detail.id, status: { not: 'PAID' } },
          data: { status: 'PAID', paidAt: new Date() },
        })
        if (claimDetail.count !== 1) continue
        const balanceBefore = wallet.balance.toNumber()
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            investmentId: detail.investmentId,
            type: 'DIVIDEND',
            amount: detail.netAmount,
            balanceBefore,
            balanceAfter: balanceBefore + detail.netAmount.toNumber(),
            currency: 'EGP',
            status: 'COMPLETED',
            reference: dist.distributionNumber,
            description: `توزيع أرباح ${dist.distributionNumber}`,
            processedAt: new Date(),
          },
        })
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: detail.netAmount } },
        })
        await tx.profitDistributionDetail.update({
          where: { id: detail.id },
          data: { status: 'PAID', paidAt: new Date() },
        })
        // Update investment realized profit
        await tx.investment.update({
          where: { id: detail.investmentId },
          data: {
            realizedProfit: { increment: detail.netAmount },
            totalDistributions: { increment: detail.netAmount },
          },
        })
      }
      return tx.profitDistribution.update({
        where: { id },
        data: { status: 'COMPLETED', distributedAt: new Date() },
        include: { details: true },
      })
    }, { maxWait: 30000, timeout: 60000 })
  }

  async getDistributions(projectId?: string) {
    const where: Prisma.ProfitDistributionWhereInput = {}
    if (projectId) where.projectId = projectId
    return this.prisma.profitDistribution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true, code: true } },
        _count: { select: { details: true } },
      },
    })
  }
}
