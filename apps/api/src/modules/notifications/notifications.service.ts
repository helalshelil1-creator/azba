import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { NotificationType, NotificationChannel } from '@prisma/client'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const page = Math.max(1, Math.floor(Number(query.page)) || 1)
    const limit = Math.min(Math.max(1, Math.floor(Number(query.limit)) || 20), 100)
    const where: any = { userId }
    if (query.unreadOnly) where.readAt = null
    const [data, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ])
    return {
      data,
      unread,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async markAsRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } })
    if (!notif || notif.userId !== userId) return { success: false }
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } })
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  }

  async create(data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    channels?: NotificationChannel[]
    data?: any
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        channels: data.channels || ['IN_APP'],
        sentAt: new Date(),
      },
    })
  }

  async createBulk(userIds: string[], data: Omit<Parameters<NotificationsService['create']>[0], 'userId'>) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        ...data,
        userId,
        channels: data.channels || ['IN_APP'],
        sentAt: new Date(),
      })),
    })
  }

  // In-app notification for project updates to all investors
  async notifyProjectInvestors(projectId: string, data: { type: NotificationType; title: string; message: string }) {
    const investments = await this.prisma.investment.findMany({
      where: { projectId, status: { in: ['ACTIVE', 'CONFIRMED', 'COMPLETED'] } },
      select: { userId: true },
      distinct: ['userId'],
    })
    const userIds = investments.map((i) => i.userId)
    if (userIds.length === 0) return { count: 0 }
    await this.createBulk(userIds, { ...data, channels: ['IN_APP', 'EMAIL'] })
    return { count: userIds.length }
  }

  async getStats() {
    const [total, unread, byType] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { readAt: null } }),
      this.prisma.notification.groupBy({ by: ['type'], _count: true }),
    ])
    return { total, unread, byType }
  }
}
