import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProjectDto, UpdateProjectDto, PublishProjectDto, ProjectQueryDto } from './dto/project.dto'
import { Prisma, ProjectStatus, RiskLevel } from '@prisma/client'
import { randomBytes } from 'crypto'

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name)

  constructor(private readonly prisma: PrismaService) {}

  private generateCode(): string {
    const year = new Date().getFullYear().toString().slice(-2)
    const rand = randomBytes(3).toString('hex').toUpperCase()
    return `PRJ-${year}-${rand}`
  }

  async create(dto: CreateProjectDto, userId: string) {
    const farm = await this.prisma.farm.findUnique({ where: { id: dto.farmId } })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')

    const totalBudget = dto.totalShares * dto.sharePrice

    return this.prisma.project.create({
      data: {
        farmId: dto.farmId,
        code: this.generateCode(),
        name: dto.name,
        nameEn: dto.nameEn,
        description: dto.description,
        animalType: dto.animalType,
        breed: dto.breed,
        breedEn: dto.breedEn,
        purpose: dto.purpose,
        status: 'DRAFT',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        expectedEndDate: dto.expectedEndDate ? new Date(dto.expectedEndDate) : null,
        totalShares: dto.totalShares,
        availableShares: dto.totalShares,
        targetAmount: totalBudget,
        sharePrice: dto.sharePrice,
        minSharesPerInvestor: dto.minSharesPerInvestor || 1,
        maxSharesPerInvestor: dto.maxSharesPerInvestor,
        totalBudget,
        expectedReturnRate: dto.expectedReturnRate,
        riskLevel: dto.riskLevel || 'MEDIUM',
        riskDisclosure: dto.riskDisclosure,
        createdBy: userId,
        // Create project shares
        shares: {
          create: Array.from({ length: dto.totalShares }, (_, i) => ({
            shareNumber: String(i + 1),
            status: 'AVAILABLE',
          })),
        },
        // Link animals
        ...(dto.animalIds?.length && {
          projectAnimals: { create: dto.animalIds.map((animalId) => ({ animalId })) },
        }),
      },
      include: { farm: { select: { name: true, city: true, governorate: true } } },
    })
  }

  async findAll(query: ProjectQueryDto, isPublic = false) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const skip = (page - 1) * limit

    const where: Prisma.ProjectWhereInput = {}
    if (isPublic) where.status = { in: ['FUNDING', 'FUNDED', 'ACTIVE', 'COMPLETED'] }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { breed: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    if (query.animalType) where.animalType = query.animalType
    if (query.riskLevel) where.riskLevel = query.riskLevel
    if (query.status && !isPublic) where.status = query.status

    const orderBy: Prisma.ProjectOrderByWithRelationInput =
      query.sort === 'funding'
        ? { fundedAmount: 'desc' }
        : query.sort === 'return'
          ? { expectedReturnRate: 'desc' }
          : query.sort === 'newest'
            ? { createdAt: 'desc' }
            : { createdAt: 'desc' }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          farm: { select: { name: true, city: true, governorate: true } },
          _count: { select: { investments: true, projectAnimals: true } },
          projectAnimals: { select: { animal: { select: { id: true, animalId: true, media: { take: 1, where: { isPrimary: true } } } } }, take: 1 },
        },
      }),
      this.prisma.project.count({ where }),
    ])

    return {
      data: projects.map((p) => ({
        ...p,
        fundedPercent: p.totalBudget != null && p.totalBudget.toNumber() > 0 ? Math.round(((p.fundedAmount?.toNumber() ?? 0) / p.totalBudget.toNumber()) * 100) : 0,
        coverImage: p.projectAnimals?.[0]?.animal?.media?.[0]?.url || null,
        projectAnimals: undefined,
      })),
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        farm: true,
        projectAnimals: {
          include: {
            animal: {
              include: {
                media: { take: 4 },
                weightRecords: { orderBy: { recordedAt: 'desc' }, take: 1 },
                healthRecords: { orderBy: { startDate: 'desc' }, take: 3 },
              },
            },
          },
        },
        shares: { select: { status: true }, where: { status: 'AVAILABLE' } },
        _count: { select: { investments: true, reservations: true } },
      },
    })
    if (!project) throw new NotFoundException('المشروع غير موجود')
    return project
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } })
    if (!project) throw new NotFoundException('المشروع غير موجود')
    if (project.status !== 'DRAFT' && project.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('لا يمكن تعديل مشروع قيد التنفيذ')
    }
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.expectedEndDate && { expectedEndDate: new Date(dto.expectedEndDate) }),
      },
    })
  }

  async publish(id: string, dto: PublishProjectDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { projectAnimals: true },
    })
    if (!project) throw new NotFoundException('المشروع غير موجود')

    if (dto.status === 'FUNDING') {
      // Validate
      if (!project.startDate) throw new BadRequestException('يجب تحديد تاريخ البدء')
      if (project.availableShares !== project.totalShares) {
        throw new BadRequestException('يجب أن تكون كل الأسهم متاحة')
      }
      if (project.projectAnimals.length === 0) {
        throw new BadRequestException('يجب إضافة حيوانات للمشروع')
      }
      return this.prisma.project.update({
        where: { id },
        data: { status: 'FUNDING', publishedAt: new Date(), approvedBy: userId, approvedAt: new Date() },
      })
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        status: dto.status,
        approvedBy: userId,
        approvedAt: new Date(),
        ...(dto.status === 'CANCELLED' && { actualEndDate: new Date() }),
      },
    })
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { investments: true } } },
    })
    if (!project) throw new NotFoundException('المشروع غير موجود')
    if (project._count.investments > 0) {
      throw new BadRequestException('لا يمكن حذف مشروع عليه استثمارات')
    }
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    })
  }

  async getStats() {
    const [byStatus, byType, totalFunded, count] = await Promise.all([
      this.prisma.project.groupBy({ by: ['status'], _count: true, _sum: { fundedAmount: true } }),
      this.prisma.project.groupBy({ by: ['animalType'], _count: true }),
      this.prisma.project.aggregate({ _sum: { fundedAmount: true } }),
      this.prisma.project.count(),
    ])
    return { byStatus, byType, totalFunded: totalFunded._sum.fundedAmount || 0, count }
  }

  async getFinancials(projectId: string) {
    const [revenue, expenses, distributions] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { projectId, status: { in: ['COMPLETED', 'DELIVERED'] } },
        _sum: { netPrice: true },
      }),
      this.prisma.expense.aggregate({
        where: { projectId, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      this.prisma.profitDistribution.aggregate({
        where: { projectId },
        _sum: { netProfit: true, investorPool: true },
      }),
    ])
    const totalRevenue = revenue._sum.netPrice?.toNumber() || 0
    const totalExpenses = expenses._sum.totalAmount?.toNumber() || 0
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      investorPool: distributions._sum.investorPool?.toNumber() || 0,
    }
  }
}
