import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      users, investors, investments, activeProjects, farms, animals,
      revenue, expenses, pendingPayments, withdrawals, openTickets, recentAudit,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'INVESTOR', deletedAt: null } }),
      this.prisma.investment.count({ where: { deletedAt: null } }),
      this.prisma.project.count({ where: { status: { in: ['FUNDING', 'FUNDED', 'ACTIVE'] } } }),
      this.prisma.farm.count({ where: { deletedAt: null } }),
      this.prisma.animal.count({ where: { deletedAt: null } }),
      this.prisma.sale.aggregate({
        where: { status: { in: ['COMPLETED', 'DELIVERED'] } },
        _sum: { netPrice: true },
      }),
      this.prisma.expense.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.walletTransaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ])

    const totalInvested = await this.prisma.investment.aggregate({
      where: { status: { in: ['ACTIVE', 'COMPLETED', 'CONFIRMED'] } },
      _sum: { netAmount: true },
    })

    return {
      stats: {
        totalUsers: users,
        totalInvestors: investors,
        totalInvestments: investments,
        totalInvestedAmount: totalInvested._sum.netAmount?.toNumber() || 0,
        totalProjects: await this.prisma.project.count(),
        activeProjects,
        totalFarms: farms,
        totalAnimals: animals,
        totalRevenue: revenue._sum.netPrice?.toNumber() || 0,
        totalExpenses: expenses._sum.totalAmount?.toNumber() || 0,
        netProfit: (revenue._sum.netPrice?.toNumber() || 0) - (expenses._sum.totalAmount?.toNumber() || 0),
        pendingPayments,
        pendingWithdrawals: withdrawals,
        openTickets,
      },
      recentAudit,
    }
  }

  async getKPIs() {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      newUsersMonth, newUsersLastMonth,
      newInvestmentsMonth, investmentValueMonth,
      revenueMonth, expensesMonth,
      activeFarms, totalPens, occupancy,
    ] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
      this.prisma.investment.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.investment.aggregate({ where: { createdAt: { gte: monthStart } }, _sum: { netAmount: true } }),
      this.prisma.sale.aggregate({ where: { saleDate: { gte: monthStart }, status: { in: ['COMPLETED', 'DELIVERED'] } }, _sum: { netPrice: true } }),
      this.prisma.expense.aggregate({ where: { expenseDate: { gte: monthStart } }, _sum: { totalAmount: true } }),
      this.prisma.farm.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.pen.count({ where: { deletedAt: null } }),
      this.prisma.pen.aggregate({ _avg: { currentCount: true } }),
    ])

    const growth = (current: number, previous: number) =>
      previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100)

    return {
      newUsersMonth,
      userGrowth: growth(newUsersMonth, newUsersLastMonth),
      newInvestmentsMonth,
      investmentValueMonth: investmentValueMonth._sum.netAmount?.toNumber() || 0,
      revenueMonth: revenueMonth._sum.netPrice?.toNumber() || 0,
      expensesMonth: expensesMonth._sum.totalAmount?.toNumber() || 0,
      activeFarms,
      totalPens,
      averagePenOccupancy: occupancy._avg.currentCount || 0,
    }
  }

  async getAuditLogs(query: { page?: number; limit?: number; userId?: string; action?: string; entityType?: string }) {
    const page = Math.max(1, Math.floor(Number(query.page)) || 1)
    const limit = Math.min(Math.max(1, Math.floor(Number(query.limit)) || 20), 100)
    const where: any = {}
    if (query.userId) where.userId = query.userId
    if (query.action) where.action = query.action
    if (query.entityType) where.entityType = query.entityType
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async getPendingApprovals() {
    const [expenses, purchaseOrders, sales, withdrawals] = await Promise.all([
      this.prisma.expense.count({ where: { approvedAt: null, rejectedAt: null } }),
      this.prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }),
      this.prisma.sale.count({ where: { status: 'PENDING' } }),
      this.prisma.walletTransaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } }),
    ])
    return { expenses, purchaseOrders, sales, withdrawals }
  }

  async seedChartOfAccounts() {
    const accounts = [
      { code: '1000', name: 'الصندوق', nameEn: 'Cash', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1100', name: 'البنك', nameEn: 'Bank', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1200', name: 'الذمم المدينة', nameEn: 'Accounts Receivable', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1300', name: 'مخزون الأعلاف', nameEn: 'Feed Inventory', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1400', name: 'المخزون الحيواني', nameEn: 'Livestock Inventory', type: 'ASSET', subType: 'CURRENT_ASSET' },
      { code: '1500', name: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'ASSET', subType: 'FIXED_ASSET' },
      { code: '1510', name: 'المباني والإنشاءات', nameEn: 'Buildings', type: 'ASSET', subType: 'FIXED_ASSET', parentId: null },
      { code: '1520', name: 'الآلات والمعدات', nameEn: 'Machinery', type: 'ASSET', subType: 'FIXED_ASSET' },
      { code: '2000', name: 'الذمم الدائنة', nameEn: 'Accounts Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
      { code: '2100', name: 'رواتب مستحقة', nameEn: 'Salaries Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
      { code: '2200', name: 'أموال المستثمرين', nameEn: 'Investor Funds', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
      { code: '3000', name: 'رأس المال', nameEn: 'Capital', type: 'EQUITY', subType: 'EQUITY' },
      { code: '3100', name: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'EQUITY', subType: 'EQUITY' },
      { code: '4000', name: 'إيرادات المبيعات', nameEn: 'Sales Revenue', type: 'REVENUE', subType: 'OPERATING_REVENUE' },
      { code: '4100', name: 'إيرادات أخرى', nameEn: 'Other Revenue', type: 'REVENUE', subType: 'OTHER_REVENUE' },
      { code: '5000', name: 'تكلفة المبيعات', nameEn: 'Cost of Sales', type: 'EXPENSE', subType: 'COGS' },
      { code: '5100', name: 'مصروفات الأعلاف', nameEn: 'Feed Expenses', type: 'EXPENSE', subType: 'OPERATING' },
      { code: '5200', name: 'مصروفات بيطرية', nameEn: 'Veterinary Expenses', type: 'EXPENSE', subType: 'OPERATING' },
      { code: '5300', name: 'مصروفات عمالة', nameEn: 'Labor Expenses', type: 'EXPENSE', subType: 'OPERATING' },
      { code: '5400', name: 'مصروفات صيانة', nameEn: 'Maintenance', type: 'EXPENSE', subType: 'OPERATING' },
      { code: '5500', name: 'مصروفات إدارية', nameEn: 'Admin Expenses', type: 'EXPENSE', subType: 'ADMIN' },
    ]

    const created: string[] = []
    for (const acc of accounts) {
      const existing = await this.prisma.ledgerAccount.findUnique({ where: { code: acc.code } })
      if (!existing) {
        await this.prisma.ledgerAccount.create({ data: acc as any })
        created.push(acc.code)
      }
    }
    return { created: created.length, codes: created }
  }
}
