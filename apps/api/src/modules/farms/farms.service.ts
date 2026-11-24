import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateFarmDto, UpdateFarmDto, CreateBuildingDto, CreatePenDto, CreateEmployeeDto,
} from './dto/farm.dto'
import { Prisma } from '@prisma/client'
import { randomBytes } from 'crypto'

@Injectable()
export class FarmsService {
  private readonly logger = new Logger(FarmsService.name)

  constructor(private readonly prisma: PrismaService) {}

  private farmCode() {
    return `FRM-${randomBytes(3).toString('hex').toUpperCase()}`
  }

  // ---------- Farms ----------
  async create(dto: CreateFarmDto, userId: string) {
    return this.prisma.farm.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn,
        code: this.farmCode(),
        address: dto.address,
        city: dto.city,
        governorate: dto.governorate,
        country: dto.country || 'EG',
        latitude: dto.latitude,
        longitude: dto.longitude,
        totalArea: dto.totalArea,
        usableArea: dto.usableArea,
        managerId: dto.managerId,
        licenseNumber: dto.licenseNumber,
        employees: dto.managerId ? { create: { userId: dto.managerId, position: 'مدير مزرعة', role: 'MANAGER', hireDate: new Date() } } : undefined,
      },
      include: { manager: { select: { firstName: true, lastName: true, email: true } } },
    })
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const where: Prisma.FarmWhereInput = { deletedAt: null }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { governorate: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    const [farms, total] = await Promise.all([
      this.prisma.farm.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          manager: { select: { firstName: true, lastName: true } },
          _count: { select: { animals: true, pens: true, buildings: true, projects: true } },
        },
      }),
      this.prisma.farm.count({ where }),
    ])
    return {
      data: farms,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async findOne(id: string) {
    // نقطة عامة: لا نكشف بريد/هاتف مدير المزرعة ولا المزارع المحذوفة
    const farm = await this.prisma.farm.findFirst({
      where: { id, deletedAt: null },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        buildings: { where: { deletedAt: null }, include: { _count: { select: { pens: true } } } },
        pens: { where: { deletedAt: null }, include: { _count: { select: { animals: true } } } },
        _count: { select: { animals: true, projects: true, employees: true } },
      },
    })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')
    return farm
  }

  async update(id: string, dto: UpdateFarmDto) {
    const farm = await this.prisma.farm.findUnique({ where: { id } })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')
    return this.prisma.farm.update({
      where: { id },
      data: dto,
      include: { manager: { select: { firstName: true, lastName: true } } },
    })
  }

  async remove(id: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: { _count: { select: { animals: true, projects: true } } },
    })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')
    if (farm._count.animals > 0 || farm._count.projects > 0) {
      throw new BadRequestException('لا يمكن حذف مزرعة مرتبطة بحيوانات أو مشاريع')
    }
    return this.prisma.farm.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } })
  }

  // ---------- Buildings ----------
  async createBuilding(farmId: string, dto: CreateBuildingDto) {
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')
    const exists = await this.prisma.farmBuilding.findFirst({ where: { farmId, code: dto.code } })
    if (exists) throw new BadRequestException('رمز المبنى مستخدم في هذه المزرعة')
    return this.prisma.farmBuilding.create({ data: { ...dto, farmId } })
  }

  async updateBuilding(id: string, dto: any) {
    const building = await this.prisma.farmBuilding.findUnique({ where: { id } })
    if (!building) throw new NotFoundException('المبنى غير موجود')
    if (dto.code && dto.code !== building.code) {
      const dup = await this.prisma.farmBuilding.findFirst({ where: { farmId: building.farmId, code: dto.code, id: { not: id } } })
      if (dup) throw new BadRequestException('رمز المبنى مستخدم في هذه المزرعة')
    }
    return this.prisma.farmBuilding.update({ where: { id }, data: dto })
  }

  // ---------- Pens ----------
  async createPen(farmId: string, dto: CreatePenDto) {
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')
    const exists = await this.prisma.pen.findFirst({ where: { farmId, code: dto.code } })
    if (exists) throw new BadRequestException('رمز الحظيرة مستخدم في هذه المزرعة')
    return this.prisma.pen.create({ data: { ...dto, farmId } })
  }

  async updatePen(id: string, dto: any) {
    const pen = await this.prisma.pen.findUnique({ where: { id } })
    if (!pen) throw new NotFoundException('الحظيرة غير موجودة')
    if (dto.code && dto.code !== pen.code) {
      const dup = await this.prisma.pen.findFirst({ where: { farmId: pen.farmId, code: dto.code, id: { not: id } } })
      if (dup) throw new BadRequestException('رمز الحظيرة مستخدم في هذه المزرعة')
    }
    if (dto.capacity != null && dto.capacity < pen.currentCount) {
      throw new BadRequestException('السعة أقل من عدد الحيوانات الموجودة حاليًا')
    }
    return this.prisma.pen.update({ where: { id }, data: dto })
  }

  async removePen(id: string) {
    const pen = await this.prisma.pen.findUnique({ where: { id }, include: { _count: { select: { animals: true } } } })
    if (!pen) throw new NotFoundException('الحظيرة غير موجودة')
    if (pen._count.animals > 0) throw new BadRequestException('لا يمكن حذف حظيرة تحتوي حيوانات')
    return this.prisma.pen.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } })
  }

  // ---------- Employees ----------
  async addEmployee(farmId: string, dto: CreateEmployeeDto) {
    const farm = await this.prisma.farm.findUnique({ where: { id: farmId } })
    if (!farm) throw new NotFoundException('المزرعة غير موجودة')
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } })
    if (!user || user.deletedAt) throw new NotFoundException('المستخدم غير موجود')
    const existing = await this.prisma.farmEmployee.findFirst({
      where: { farmId, userId: dto.userId, status: 'ACTIVE' },
    })
    if (existing) throw new BadRequestException('الموظف مضاف بالفعل لهذه المزرعة')
    return this.prisma.farmEmployee.create({
      data: { farmId, userId: dto.userId, position: dto.position || dto.role || 'موظف', role: dto.role, salary: dto.salary, hireDate: new Date() },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    })
  }

  async removeEmployee(employeeId: string) {
    const emp = await this.prisma.farmEmployee.findUnique({ where: { id: employeeId } })
    if (!emp) throw new NotFoundException('الموظف غير موجود')
    return this.prisma.farmEmployee.update({
      where: { id: employeeId },
      data: { status: 'INACTIVE', endDate: new Date() },
    })
  }

  // ---------- Stats ----------
  async getStats() {
    const [total, byStatus, totalAnimals, totalPens] = await Promise.all([
      this.prisma.farm.count({ where: { deletedAt: null } }),
      this.prisma.farm.groupBy({ by: ['status'], _count: true }),
      this.prisma.animal.count({ where: { deletedAt: null } }),
      this.prisma.pen.count({ where: { deletedAt: null } }),
    ])
    return { total, byStatus, totalAnimals, totalPens }
  }
}
