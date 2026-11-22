import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
  Logger, ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateReservationDto, ConfirmInvestmentDto, WithdrawalDto, InvestmentQueryDto,
} from './dto/investment.dto'
import { Prisma, InvestmentStatus, TransactionStatus, TransactionType, PaymentMethod } from '@prisma/client'
import { randomBytes } from 'crypto'
import { addMinutes } from 'date-fns'

const RESERVATION_TTL_MINUTES = 30

@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ---------- Investor portfolio ----------
  async getDashboard(userId: string) {
    const [
      investments,
      wallet,
      activeCount,
      completedCount,
      distributions,
      notifications,
    ] = await Promise.all([
      this.prisma.investment.findMany({
        where: { userId, deletedAt: null },
        include: {
          project: { select: { id: true, name: true, code: true, status: true, animalType: true, breed: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wallet.findUnique({ where: { userId } }),
      this.prisma.investment.count({ where: { userId, status: { in: ['ACTIVE', 'CONFIRMED', 'RESERVED', 'PENDING_PAYMENT'] } } }),
      this.prisma.investment.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.profitDistributionDetail.aggregate({
        where: { investment: { userId }, status: 'PENDING' },
        _sum: { netAmount: true },
      }),
      this.prisma.notification.findMany({
        where: { userId, readAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const totalInvested = investments
      .filter((i) => i.status !== 'CANCELLED' && i.status !== 'REFUNDED')
      .reduce((s, i) => s + i.netAmount.toNumber(), 0)
    const realizedProfit = investments.reduce((s, i) => s + i.realizedProfit.toNumber(), 0)
    const unrealizedProfit = investments.reduce((s, i) => s + i.unrealizedProfit.toNumber(), 0)
    const totalDistributions = investments.reduce((s, i) => s + i.totalDistributions.toNumber(), 0)
    const totalShares = investments
      .filter((i) => i.status !== 'CANCELLED' && i.status !== 'REFUNDED')
      .reduce((s, i) => s + i.shareCount, 0)
    const portfolioValue = investments
      .filter((i) => i.status === 'ACTIVE' || i.status === 'CONFIRMED')
      .reduce((s, i) => s + (i.currentValue?.toNumber() ?? i.netAmount.toNumber()), 0)

    return {
      stats: {
        totalInvested,
        portfolioValue,
        realizedProfit,
        unrealizedProfit,
        losses: Math.max(0, -unrealizedProfit),
        totalShares,
        activeProjects: activeCount,
        completedProjects: completedCount,
        pendingDistributions: distributions._sum.netAmount?.toNumber() || 0,
        walletBalance: wallet?.balance.toNumber() || 0,
        walletLocked: wallet?.lockedBalance.toNumber() || 0,
      },
      investments,
      notifications,
    }
  }

  async getInvestments(userId: string, query: InvestmentQueryDto) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const where: Prisma.InvestmentWhereInput = { userId, deletedAt: null }
    if (query.status) where.status = query.status as InvestmentStatus

    const [data, total] = await Promise.all([
      this.prisma.investment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true, code: true, status: true, animalType: true } },
          distributionDetails: true,
        },
      }),
      this.prisma.investment.count({ where }),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async getInvestment(userId: string, id: string) {
    const investment = await this.prisma.investment.findUnique({
      where: { id },
      include: {
        project: { include: { farm: true } },
        payments: true,
        distributionDetails: { include: { distribution: true } },
      },
    })
    if (!investment) throw new NotFoundException('الاستثمار غير موجود')
    if (investment.userId !== userId) throw new ForbiddenException('غير مصرح')
    return investment
  }

  // ---------- Reservation (share booking) ----------
  async createReservation(userId: string, dto: CreateReservationDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { _count: { select: { shares: { where: { status: 'AVAILABLE' } } } } },
    })
    if (!project) throw new NotFoundException('المشروع غير موجود')
    if (project.status !== 'FUNDING' && project.status !== 'FUNDED') {
      throw new BadRequestException('المشروع غير متاح للاستثمار حاليًا')
    }
    if (project.minSharesPerInvestor != null && dto.shareCount < project.minSharesPerInvestor) {
      throw new BadRequestException(`الحد الأدنى ${project.minSharesPerInvestor} أسهم`)
    }
    if (project.maxSharesPerInvestor && dto.shareCount > project.maxSharesPerInvestor) {
      throw new BadRequestException(`الحد الأقصى ${project.maxSharesPerInvestor} أسهم`)
    }
    if ((project.availableShares ?? 0) < dto.shareCount) {
      throw new BadRequestException('لا توجد أسهم كافية متاحة')
    }

    return this.prisma.$transaction(async (tx) => {
      // Lock the project row to prevent overselling
      const locked = await tx.$queryRaw<Array<{ availableShares: number }>>`
        SELECT "availableShares" FROM projects WHERE id = ${dto.projectId} FOR UPDATE
      `
      if (!locked[0] || locked[0].availableShares < dto.shareCount) {
        throw new BadRequestException('لا توجد أسهم كافية متاحة')
      }

      // Expire old pending reservations for this user/project
      await tx.shareReservation.updateMany({
        where: { userId, projectId: dto.projectId, status: 'PENDING', expiresAt: { lt: new Date() } },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: 'EXPIRED' },
      })

      // Restore shares from expired reservations
      await tx.$executeRaw`
        UPDATE project_shares SET status = 'AVAILABLE', "reservedBy" = NULL, "reservedAt" = NULL,
          "reservationExpiresAt" = NULL
        WHERE status = 'RESERVED' AND "reservationExpiresAt" < NOW()
      `

      // Reserve shares
      const shares = await tx.projectShare.findMany({
        where: { projectId: dto.projectId, status: 'AVAILABLE' },
        orderBy: { shareNumber: 'asc' },
        take: dto.shareCount,
      })

      const reservation = await tx.shareReservation.create({
        data: {
          projectId: dto.projectId,
          userId,
          shareCount: dto.shareCount,
          unitPrice: project.sharePrice,
          totalAmount: project.sharePrice.toNumber() * dto.shareCount,
          currency: project.shareCurrency,
          expiresAt: addMinutes(new Date(), RESERVATION_TTL_MINUTES),
        },
      })

      await tx.projectShare.updateMany({
        where: { id: { in: shares.map((s) => s.id) } },
        data: { status: 'RESERVED', reservedBy: userId, reservedAt: new Date(), reservationExpiresAt: reservation.expiresAt },
      })

      await tx.project.update({
        where: { id: dto.projectId },
        data: { availableShares: { decrement: dto.shareCount } },
      })

      this.logger.log(`Reservation created: ${reservation.id} for ${dto.shareCount} shares`)

      return reservation
    })
  }

  async getReservations(userId: string) {
    return this.prisma.shareReservation.findMany({
      where: { userId, status: 'PENDING' },
      include: { project: { select: { id: true, name: true, sharePrice: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async cancelReservation(userId: string, reservationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.shareReservation.findUnique({ where: { id: reservationId } })
      if (!reservation || reservation.userId !== userId) throw new NotFoundException('الحجز غير موجود')
      if (reservation.status !== 'PENDING') throw new BadRequestException('لا يمكن إلغاء هذا الحجز')

      await tx.projectShare.updateMany({
        where: { reservedBy: userId, reservationExpiresAt: reservation.expiresAt },
        data: { status: 'AVAILABLE', reservedBy: null, reservedAt: null, reservationExpiresAt: null },
      })
      await tx.project.update({
        where: { id: reservation.projectId },
        data: { availableShares: { increment: reservation.shareCount } },
      })
      return tx.shareReservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: 'USER_CANCELLED' },
      })
    })
  }

  // ---------- Confirm investment (sandbox payment) ----------
  async confirmInvestment(userId: string, dto: ConfirmInvestmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.shareReservation.findUnique({ where: { id: dto.reservationId } })
      if (!reservation || reservation.userId !== userId) throw new NotFoundException('الحجز غير موجود')
      if (reservation.status !== 'PENDING') throw new BadRequestException('الحجز غير صالح')
      if (reservation.expiresAt < new Date()) {
        throw new BadRequestException('انتهت صلاحية الحجز')
      }
      if (!dto.acceptContract) throw new BadRequestException('يجب الموافقة على العقد')

      const project = await tx.project.findUnique({ where: { id: reservation.projectId } })
      if (!project) throw new NotFoundException('المشروع غير موجود')

      const totalAmount = reservation.totalAmount.toNumber()
      const fee = Math.round(totalAmount * 0.015 * 100) / 100 // 1.5% platform fee
      const netAmount = totalAmount - fee

      const contractNumber = `CNT-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`

      const investment = await tx.investment.create({
        data: {
          projectId: reservation.projectId,
          userId,
          reservationId: reservation.id,
          shareCount: reservation.shareCount,
          unitPrice: project.sharePrice,
          sharePrice: project.sharePrice,
          grossAmount: totalAmount,
          totalAmount,
          fees: fee,
          netAmount,
          currency: reservation.currency,
          status: 'ACTIVE',
          contractNumber,
          contractSignedAt: new Date(),
          paidAt: new Date(),
          confirmedAt: new Date(),
          activatedAt: new Date(),
        },
      })

      // Create payment record (sandbox)
      await tx.payment.create({
        data: {
          investmentId: investment.id,
          userId,
          amount: totalAmount,
          currency: reservation.currency,
          method: dto.paymentMethod,
          provider: dto.paymentMethod === 'SANDBOX' ? 'SANDBOX' : dto.providerRef,
          providerRef: dto.providerRef || `SANDBOX-${randomBytes(6).toString('hex').toUpperCase()}`,
          status: 'COMPLETED',
          completedAt: new Date(),
          webhookReceived: true,
        },
      })

      // Mark shares as sold
      await tx.projectShare.updateMany({
        where: { reservedBy: userId, reservationExpiresAt: reservation.expiresAt },
        data: { status: 'SOLD', soldTo: userId, soldAt: new Date(), priceAtSale: project.sharePrice },
      })

      // Update project funding
      await tx.project.update({
        where: { id: project.id },
        data: {
          fundedAmount: { increment: totalAmount },
          ...(((project.availableShares ?? 0) <= reservation.shareCount) ? { status: 'FUNDED' } : {}),
        },
      })

      // Reservation converted
      await tx.shareReservation.update({
        where: { id: reservation.id },
        data: { status: 'CONVERTED', confirmedAt: new Date(), convertedToInvestmentId: investment.id },
      })

      // Wallet transaction
      const wallet = await tx.wallet.findUnique({ where: { userId } })
      if (wallet) {
        const balanceBefore = wallet.balance.toNumber()
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            investmentId: investment.id,
            type: 'INVESTMENT',
            amount: -netAmount,
            balanceBefore,
            balanceAfter: balanceBefore - netAmount,
            currency: 'EGP',
            status: 'COMPLETED',
            reference: contractNumber,
            description: `استثمار في ${project.name}`,
            processedAt: new Date(),
          },
        })
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: netAmount } },
        })
      }

      // Notification
      await tx.notification.create({
        data: {
          userId,
          type: 'INVESTMENT_CREATED',
          title: 'تم تأكيد استثمارك',
          message: `تم تأكيد استثمارك في ${project.name} بعدد ${reservation.shareCount} أسهم بعقد رقم ${contractNumber}`,
          channels: ['IN_APP', 'EMAIL'],
          sentAt: new Date(),
        },
      })

      this.logger.log(`Investment confirmed: ${investment.id} contract ${contractNumber}`)

      return investment
    }, { maxWait: 15000, timeout: 30000 })
  }

  async cancelInvestment(userId: string, id: string) {
    const investment = await this.prisma.investment.findUnique({ where: { id } })
    if (!investment || investment.userId !== userId) throw new NotFoundException('الاستثمار غير موجود')
    if (investment.status !== 'PENDING_PAYMENT' && investment.status !== 'RESERVED') {
      throw new BadRequestException('لا يمكن إلغاء هذا الاستثمار')
    }
    return this.prisma.investment.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: 'USER_CANCELLED' },
    })
  }

  // ---------- Wallet ----------
  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    })
    if (!wallet) throw new NotFoundException('المحفظة غير موجودة')
    return wallet
  }

  async getWalletTransactions(userId: string, query: InvestmentQueryDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) throw new NotFoundException('المحفظة غير موجودة')
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async requestWithdrawal(userId: string, dto: WithdrawalDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) throw new NotFoundException('المحفظة غير موجودة')
    const balance = wallet.balance.toNumber()
    if (dto.amount > balance) throw new BadRequestException('الرصيد غير كافٍ')
    if (dto.amount < 100) throw new BadRequestException('الحد الأدنى للسحب 100 ج.م')

    return this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          amount: -dto.amount,
          balanceBefore: balance,
          balanceAfter: balance - dto.amount,
          currency: 'EGP',
          status: 'PENDING',
          description: 'طلب سحب',
        },
      })
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: dto.amount }, lockedBalance: { increment: dto.amount } },
      })
      await tx.notification.create({
        data: {
          userId,
          type: 'WITHDRAWAL_REQUEST',
          title: 'طلب سحب جديد',
          message: `تم استلام طلب سحب بمبلغ ${dto.amount} ج.م وهو قيد المراجعة`,
          channels: ['IN_APP', 'EMAIL'],
          sentAt: new Date(),
        },
      })
      return txRecord
    })
  }

  // ---------- Admin: all investments ----------
  async findAll(query: InvestmentQueryDto) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const [data, total] = await Promise.all([
      this.prisma.investment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.investment.count(),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async expireOldReservations() {
    const expired = await this.prisma.shareReservation.findMany({
      where: { status: 'PENDING', expiresAt: { lt: new Date() } },
      select: { id: true, userId: true, projectId: true, shareCount: true, expiresAt: true },
    })
    if (expired.length === 0) return 0

    await this.prisma.$transaction(async (tx) => {
      for (const r of expired) {
        await tx.projectShare.updateMany({
          where: { reservedBy: r.userId, reservationExpiresAt: r.expiresAt },
          data: { status: 'AVAILABLE', reservedBy: null, reservedAt: null, reservationExpiresAt: null },
        })
        await tx.project.update({
          where: { id: r.projectId },
          data: { availableShares: { increment: r.shareCount } },
        })
        await tx.shareReservation.update({
          where: { id: r.id },
          data: { status: 'EXPIRED', cancelledAt: new Date(), cancellationReason: 'EXPIRED' },
        })
      }
    })
    this.logger.log(`Expired ${expired.length} reservations`)
    return expired.length
  }
}
