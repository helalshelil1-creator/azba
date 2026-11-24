import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common'
import { UserRole, UserStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

const PRIVILEGED_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN']

/** قواعد منع تصعيد الصلاحيات: الأدمن لا يلمس الأدمن/المدير العام ولا يعدّل نفسه. */
export function assertCanManage(
  actor: { id: string; role: string },
  target: { id: string; role: UserRole },
  newRole?: UserRole,
) {
  if (actor.id === target.id) {
    throw new ForbiddenException('لا يمكنك تعديل حسابك بنفسك')
  }
  if (actor.role !== 'SUPER_ADMIN') {
    if (PRIVILEGED_ROLES.includes(target.role)) {
      throw new ForbiddenException('فقط المدير العام يستطيع تعديل المدراء')
    }
    if (newRole && PRIVILEGED_ROLES.includes(newRole)) {
      throw new ForbiddenException('فقط المدير العام يستطيع منح صلاحيات إدارية')
    }
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number; limit?: number; search?: string; role?: UserRole; status?: UserStatus;
  }) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const skip = (page - 1) * limit

    const where: any = {}
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ]
    }
    if (query.role) where.role = query.role
    if (query.status) where.status = query.status

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true,
          role: true, status: true, emailVerified: true, preferredLang: true,
          avatar: true, lastLoginAt: true, createdAt: true,
          _count: { select: { investments: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: users,
      meta: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        role: true, status: true, emailVerified: true, preferredLang: true,
        avatar: true, lastLoginAt: true, createdAt: true, updatedAt: true,
        investorProfile: true,
        wallet: true,
        _count: { select: { investments: true } },
      },
    })
    if (!user) throw new NotFoundException('المستخدم غير موجود')
    return user
  }

  async updateRole(id: string, role: UserRole, actor: { id: string; role: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('المستخدم غير موجود')
    assertCanManage(actor, user, role)
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })
  }

  async updateStatus(id: string, status: UserStatus, actor: { id: string; role: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('المستخدم غير موجود')
    assertCanManage(actor, user)
    if (user.role === 'SUPER_ADMIN' && status !== 'ACTIVE') {
      throw new ConflictException('لا يمكن تغيير حالة المدير العام')
    }
    if (status === 'SUSPENDED' || status === 'BLOCKED' || status === 'INACTIVE') {
      await this.prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })
    }
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, firstName: true, lastName: true, status: true },
    })
  }

  async remove(id: string, actor: { id: string; role: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('المستخدم غير موجود')
    assertCanManage(actor, user)
    await this.prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })
    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE', email: `deleted_${user.id}@deleted.local` },
      select: { id: true, email: true },
    })
  }

  async getStats() {
    const [total, byRole, byStatus, recent] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: true }),
      this.prisma.user.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
      this.prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ])
    return { total, byRole, byStatus, recent }
  }
}
