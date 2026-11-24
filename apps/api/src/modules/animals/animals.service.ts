import {
  Injectable, NotFoundException, BadRequestException, ConflictException, Logger,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateAnimalDto, UpdateAnimalDto, RecordWeightDto, CreateHealthRecordDto,
  CreateVaccinationDto, CreateVetReportDto, AnimalQueryDto,
} from './dto/animal.dto'
import { Prisma, AnimalStatus, HealthStatus } from '@prisma/client'
import { randomBytes } from 'crypto'

@Injectable()
export class AnimalsService {
  private readonly logger = new Logger(AnimalsService.name)

  constructor(private readonly prisma: PrismaService) {}

  private async generateAnimalId(farmId: string): Promise<string> {
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId }, select: { code: true } })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')
    const count = await this.prisma.animal.count({ where: { farmId } })
    return `${farm.code}-${String(count + 1).padStart(4, '0')}`
  }

  private generateQR(animalId: string): string {
    return `AZBA:${animalId}:${randomBytes(4).toString('hex').toUpperCase()}`
  }

  async create(dto: CreateAnimalDto, userId: string) {
    const farm = await this.prisma.farm.findUnique({ where: { id: dto.farmId } })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')

    if (dto.penId) {
      const pen = await this.prisma.pen.findUnique({ where: { id: dto.penId } })
      if (!pen) throw new NotFoundException('الحظيرة غير موجودة')
      if (pen.capacity != null && pen.currentCount >= pen.capacity) {
        throw new BadRequestException('الحظيرة ممتلئة')
      }
    }

    if (dto.dateOfBirth && new Date(dto.dateOfBirth).getTime() > Date.now()) {
      throw new BadRequestException('تاريخ الميلاد لا يمكن أن يكون في المستقبل')
    }
    const dupTag = await this.prisma.animal.findFirst({ where: { tagNumber: dto.tagNumber }, select: { id: true } })
    if (dupTag) throw new ConflictException('رقم التاج مستخدم من قبل')

    const animalId = await this.generateAnimalId(dto.farmId)
    const qrCode = this.generateQR(animalId)

    return this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.create({
        data: {
          farmId: dto.farmId,
          penId: dto.penId,
          projectId: dto.projectId,
          animalId,
          qrCode,
          tagNumber: dto.tagNumber,
          type: dto.type,
          breed: dto.breed,
          breedEn: dto.breedEn,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          ageMonths: dto.dateOfBirth
            ? Math.floor((Date.now() - new Date(dto.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
            : null,
          purchaseWeight: dto.purchaseWeight,
          purchasePrice: dto.purchasePrice,
          purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
          supplierId: dto.supplierId,
          color: dto.color,
          notes: dto.notes,
          healthStatus: 'HEALTHY',
          status: 'ACTIVE',
          media: {
            create: {
              type: 'IMAGE',
              url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`,
              fileName: `${animalId}-qr.png`,
              fileSize: 0,
              mimeType: 'image/png',
              description: 'QR Code',
              uploadedBy: userId,
            },
          },
        },
        include: { farm: { select: { name: true, code: true } }, pen: { select: { name: true, code: true } } },
      })

      if (dto.penId) {
        await tx.pen.update({
          where: { id: dto.penId },
          data: { currentCount: { increment: 1 } },
        })
      }

      // Record initial weight if provided
      if (dto.purchaseWeight) {
        await tx.weightRecord.create({
          data: {
            animalId: animal.id,
            projectId: dto.projectId,
            recordedBy: userId,
            weight: dto.purchaseWeight,
            recordedAt: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
            method: 'SCALE',
            notes: 'وزن الشراء',
          },
        })
      }

      // Link to project if provided
      if (dto.projectId) {
        const project = await tx.project.findUnique({ where: { id: dto.projectId } })
        if (project) {
          await tx.projectAnimal.create({ data: { projectId: dto.projectId, animalId: animal.id, shareCount: 1 } })
        }
      }

      this.logger.log(`Animal registered: ${animalId}`)
      return animal
    })
  }

  async findAll(query: AnimalQueryDto) {
    const page = Math.max(1, Math.floor(Number(query.page)) || 1)
    const limit = Math.min(Math.max(1, Math.floor(Number(query.limit)) || 20), 100)
    const where: Prisma.AnimalWhereInput = { deletedAt: null }
    if (query.farmId) where.farmId = query.farmId
    if (query.penId) where.penId = query.penId
    if (query.projectId) where.projectId = query.projectId
    if (query.type) where.type = query.type
    if (query.healthStatus) where.healthStatus = query.healthStatus
    if (query.status) where.status = query.status
    if (query.search) {
      where.OR = [
        { animalId: { contains: query.search, mode: 'insensitive' } },
        { tagNumber: { contains: query.search, mode: 'insensitive' } },
        { breed: { contains: query.search, mode: 'insensitive' } },
        { qrCode: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [animals, total] = await Promise.all([
      this.prisma.animal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          farm: { select: { name: true, city: true } },
          pen: { select: { name: true, code: true } },
          media: { where: { isPrimary: true }, take: 1 },
          weightRecords: { orderBy: { recordedAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.animal.count({ where }),
    ])
    return {
      data: animals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async findOne(id: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: {
        farm: true,
        pen: true,
        project: { select: { id: true, name: true, code: true, status: true } },
        media: true,
        weightRecords: { orderBy: { recordedAt: 'desc' }, take: 20 },
        healthRecords: { orderBy: { startDate: 'desc' }, take: 20 },
        vaccinations: { orderBy: { administeredAt: 'desc' }, take: 20 },
        veterinaryReports: { orderBy: { examinationDate: 'desc' }, take: 10, include: { veterinarian: { select: { firstName: true, lastName: true } } } },
        movements: { orderBy: { movedAt: 'desc' }, take: 20 },
        feedRecords: { orderBy: { fedAt: 'desc' }, take: 20 },
      },
    })
    if (!animal) throw new NotFoundException('الحيوان غير موجود')
    return animal
  }

  async findByQR(qr: string) {
    const animal = await this.prisma.animal.findUnique({
      where: { qrCode: qr },
      include: {
        farm: { select: { name: true, city: true, governorate: true } },
        pen: { select: { name: true } },
        weightRecords: { orderBy: { recordedAt: 'desc' }, take: 10 },
        healthRecords: { orderBy: { startDate: 'desc' }, take: 10 },
        vaccinations: { orderBy: { administeredAt: 'desc' }, take: 10 },
        veterinaryReports: { orderBy: { examinationDate: 'desc' }, take: 5, include: { veterinarian: { select: { firstName: true, lastName: true } } } },
      },
    })
    if (!animal) throw new NotFoundException('لم يتم العثور على حيوان بهذا الرمز')
    return animal
  }

  async update(id: string, dto: UpdateAnimalDto, userId: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id } })
    if (!animal) throw new NotFoundException('الحيوان غير موجود')
    return this.prisma.animal.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.dateOfBirth && {
          dateOfBirth: new Date(dto.dateOfBirth),
          ageMonths: Math.floor((Date.now() - new Date(dto.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
        }),
      },
      include: { farm: { select: { name: true } }, pen: { select: { name: true } } },
    })
  }

  async transfer(id: string, penId: string, userId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id } })
      if (!animal) throw new NotFoundException('الحيوان غير موجود')
      if (animal.status === 'DECEASED') throw new BadRequestException('لا يمكن نقل حيوان نافق')
      if (animal.penId === penId) throw new BadRequestException('الحيوان موجود بالفعل في هذه الحظيرة')
      const pen = await tx.pen.findUnique({ where: { id: penId } })
      if (!pen) throw new NotFoundException('الحظيرة غير موجودة')
      if (pen.capacity != null && pen.currentCount >= pen.capacity) throw new BadRequestException('الحظيرة المقصودة ممتلئة')

      if (animal.penId) {
        await tx.pen.update({ where: { id: animal.penId }, data: { currentCount: { decrement: 1 } } })
      }
      await tx.pen.update({ where: { id: penId }, data: { currentCount: { increment: 1 } } })
      const updated = await tx.animal.update({
        where: { id },
        data: { penId, location: pen.name },
      })
      await tx.animalMovement.create({
        data: {
          animalId: id,
          fromPenId: animal.penId,
          toPenId: penId,
          reason: reason || 'TRANSFER',
          movedBy: userId,
          notes: reason,
        },
      })
      return updated
    })
  }

  async recordDeath(id: string, data: { date: string; cause: string; notes?: string }, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id }, include: { pen: true } })
      if (!animal) throw new NotFoundException('الحيوان غير موجود')
      if (animal.status === 'DECEASED') throw new BadRequestException('تم تسجيل نفوق هذا الحيوان من قبل')
      if (animal.penId && animal.pen) {
        await tx.pen.update({ where: { id: animal.penId }, data: { currentCount: { decrement: 1 } } })
      }
      return tx.animal.update({
        where: { id },
        data: {
          penId: null,
          status: 'DECEASED',
          healthStatus: 'CRITICAL',
          deathDate: new Date(data.date),
          deathCause: data.cause,
          deathNotes: data.notes,
        },
      })
    })
  }

  // ---------- Weight ----------
  async recordWeight(dto: RecordWeightDto, userId: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id: dto.animalId } })
    if (!animal) throw new NotFoundException('الحيوان غير موجود')
    if (animal.status === 'DECEASED') throw new BadRequestException('لا يمكن تسجيل وزن لحيوان نافق')
    if (dto.recordedAt && new Date(dto.recordedAt).getTime() > Date.now() + 86400000) {
      throw new BadRequestException('تاريخ الوزن لا يمكن أن يكون في المستقبل')
    }
    return this.prisma.$transaction(async (tx) => {
      const record = await tx.weightRecord.create({
        data: {
          animalId: dto.animalId,
          projectId: dto.projectId,
          recordedBy: userId,
          weight: dto.weight,
          recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
          method: dto.method || 'SCALE',
        },
      })
      await tx.animal.update({ where: { id: dto.animalId }, data: { weight: dto.weight } })
      return record
    })
  }

  // ---------- Health ----------
  async createHealthRecord(dto: CreateHealthRecordDto, userId: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id: dto.animalId } })
    if (!animal) throw new NotFoundException('الحيوان غير موجود')
    const record = await this.prisma.healthRecord.create({
      data: {
        animalId: dto.animalId,
        recordedBy: userId,
        recordType: dto.recordType,
        title: dto.title,
        description: dto.description,
        diagnosis: dto.diagnosis,
        treatment: dto.treatment,
        cost: dto.cost,
        startDate: new Date(dto.startDate),
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
      },
    })
    if (dto.recordType === 'TREATMENT' || dto.recordType === 'MEDICATION') {
      await this.prisma.animal.update({
        where: { id: dto.animalId },
        data: { healthStatus: 'UNDER_TREATMENT' },
      })
    }
    return record
  }

  async createVaccination(dto: CreateVaccinationDto, userId: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id: dto.animalId } })
    if (!animal) throw new NotFoundException('الحيوان غير موجود')
    if (dto.administeredAt && dto.nextDueDate && new Date(dto.nextDueDate) < new Date(dto.administeredAt)) {
      throw new BadRequestException('موعد الجرعة القادمة قبل تاريخ الجرعة الحالية')
    }
    return this.prisma.vaccination.create({
      data: {
        animalId: dto.animalId,
        vaccineName: dto.vaccineName,
        vaccineType: dto.vaccineType,
        manufacturer: dto.manufacturer,
        batchNumber: dto.batchNumber,
        administeredBy: userId,
        administeredAt: dto.administeredAt ? new Date(dto.administeredAt) : new Date(),
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
        cost: dto.cost,
      },
    })
  }

  // ---------- Veterinary ----------
  async createVetReport(dto: CreateVetReportDto, userId: string, role: string) {
    if (role !== 'VETERINARIAN' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      throw new BadRequestException('يجب أن تكون طبيبًا بيطريًا معتمدًا')
    }
    const animal = await this.prisma.animal.findUnique({ where: { id: dto.animalId } })
    if (!animal) throw new NotFoundException('الحيوان غير موجود')
    return this.prisma.veterinaryReport.create({
      data: {
        animalId: dto.animalId,
        veterinarianId: userId,
        reportNumber: `RPT-${Date.now()}`,
        reportType: dto.reportType,
        examinationDate: new Date(dto.examinationDate),
        temperature: dto.temperature,
        heartRate: dto.heartRate,
        respiratoryRate: dto.respiratoryRate,
        bodyConditionScore: dto.bodyConditionScore,
        findings: dto.findings,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
        recommendations: dto.recommendations,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
      },
    })
  }

  async approveVetReport(reportId: string, userId: string, role: string) {
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'VETERINARIAN') {
      throw new BadRequestException('غير مصرح')
    }
    const report = await this.prisma.veterinaryReport.findUnique({ where: { id: reportId } })
    if (!report) throw new NotFoundException('التقرير غير موجود')
    if (report.isApproved) throw new BadRequestException('التقرير معتمد بالفعل')
    // Version control
    return this.prisma.$transaction(async (tx) => {
      // حجز ذري: اعتماد واحد فقط ينجح عند تزامن طلبين
      const claim = await tx.veterinaryReport.updateMany({
        where: { id: report.id, isApproved: false },
        data: { isApproved: true, approvedBy: userId, approvedAt: new Date() },
      })
      if (claim.count !== 1) throw new BadRequestException('التقرير معتمد بالفعل')
      const newReport = await tx.veterinaryReport.create({
        data: {
          animalId: report.animalId,
          veterinarianId: report.veterinarianId,
          reportNumber: `${report.reportNumber}-V2`,
          reportType: report.reportType,
          examinationDate: report.examinationDate,
          findings: report.findings,
          diagnosis: report.diagnosis,
          treatmentPlan: report.treatmentPlan,
          recommendations: report.recommendations,
          isApproved: true,
          approvedBy: userId,
          approvedAt: new Date(),
          version: report.version + 1,
          previousVersionId: report.id,
        },
      })
      return newReport
    })
  }

  // ---------- Stats ----------
  async getStats() {
    const [total, byType, byHealth, byStatus, recentDeaths] = await Promise.all([
      this.prisma.animal.count({ where: { deletedAt: null } }),
      this.prisma.animal.groupBy({ by: ['type'], _count: true }),
      this.prisma.animal.groupBy({ by: ['healthStatus'], _count: true }),
      this.prisma.animal.groupBy({ by: ['status'], _count: true }),
      this.prisma.animal.count({
        where: { status: 'DECEASED', deathDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
      }),
    ])
    return { total, byType, byHealth, byStatus, recentDeaths }
  }

  // ---------- Feeding ----------
  async recordFeed(dto: any, userId: string) {
    const animal = await this.prisma.animal.findUnique({ where: { id: dto.animalId } })
    if (!animal) throw new NotFoundException('الحيوان غير موجود')
    return this.prisma.feedRecord.create({
      data: {
        animalId: dto.animalId,
        feedTypeId: dto.feedTypeId,
        inventoryId: dto.inventoryId,
        recipeId: dto.recipeId,
        fedBy: userId,
        fedAt: dto.fedAt ? new Date(dto.fedAt) : new Date(),
        quantity: dto.quantity,
        unit: dto.unit || 'KG',
        cost: dto.cost,
        feedingTime: dto.feedingTime,
        notes: dto.notes,
      },
    })
  }
}
