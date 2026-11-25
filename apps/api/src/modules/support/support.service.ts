import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateTicketDto, UpdateTicketDto, AssignTicketDto, ReplyTicketDto, FeedbackDto, TicketQueryDto } from './dto/support.dto'
import { randomBytes } from 'crypto'

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name)
  constructor(private readonly prisma: PrismaService) {}

  private static readonly STAFF = ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER']
  private isStaff(role: string) {
    return SupportService.STAFF.includes(role)
  }

  private ticketNumber() {
    return `TKT-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
  }

  async create(userId: string, dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        ticketNumber: this.ticketNumber(),
        subject: dto.subject,
        description: dto.description,
        category: dto.category || 'GENERAL',
        priority: dto.priority || 'MEDIUM',
        status: 'OPEN',
        source: 'WEB',
      },
    })
  }

  async getMine(userId: string, query: TicketQueryDto) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const where: any = { userId }
    if (query.status) where.status = query.status
    if (query.category) where.category = query.category
    if (query.priority) where.priority = query.priority
    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: 'insensitive' } },
        { ticketNumber: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { assignee: { select: { firstName: true, lastName: true } }, _count: { select: { messages: true } } },
      }),
      this.prisma.supportTicket.count({ where }),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async findAll(query: TicketQueryDto) {
    const page = query.page || 1
    const limit = Math.min(query.limit || 20, 100)
    const where: any = {}
    if (query.status) where.status = query.status
    if (query.category) where.category = query.category
    if (query.priority) where.priority = query.priority
    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: 'insensitive' } },
        { ticketNumber: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          assignee: { select: { firstName: true, lastName: true } },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ])
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    }
  }

  async findOne(id: string, userId: string, role: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { firstName: true, lastName: true, role: true } } } },
      },
    })
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة')
    if (!this.isStaff(role) && ticket.userId !== userId) throw new ForbiddenException('غير مصرح')
    if (!this.isStaff(role)) {
      // الملاحظات الداخلية للموظفين فقط
      return { ...ticket, messages: ticket.messages.filter((m) => !m.isInternal) }
    }
    return ticket
  }

  async update(id: string, userId: string, role: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة')
    if (!this.isStaff(role) && ticket.userId !== userId) throw new ForbiddenException('غير مصرح')
    return this.prisma.supportTicket.update({ where: { id }, data: dto })
  }

  async assign(id: string, dto: AssignTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة')
    const assignee = await this.prisma.user.findUnique({ where: { id: dto.assigneeId } })
    if (!assignee) throw new NotFoundException('الموظف غير موجود')
    if (!this.isStaff(assignee.role)) throw new BadRequestException('لا يمكن إسناد التذكرة إلا لأحد موظفي الدعم')
    return this.prisma.supportTicket.update({
      where: { id },
      data: { assigneeId: dto.assigneeId, status: 'ASSIGNED' },
      include: { assignee: { select: { firstName: true, lastName: true } } },
    })
  }

  async reply(id: string, userId: string, role: string, dto: ReplyTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة')
    if (!this.isStaff(role) && ticket.userId !== userId) throw new ForbiddenException('غير مصرح')

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.supportMessage.create({
        data: { ticketId: id, senderId: userId, body: dto.message, isInternal: this.isStaff(role) ? dto.isInternal || false : false },
      })
      const update: any = {}
      // WAITING_USER لم يكن موجودًا في TicketStatus (كان كل رد من صاحب التذكرة يفشل بخطأ 500).
      // رد صاحب التذكرة يعيدها للمعالجة، ورد الموظف العلني ينقلها إلى PENDING_USER (بانتظار المستخدم).
      if (!this.isStaff(role)) {
        update.status = 'IN_PROGRESS'
      } else {
        update.status = dto.isInternal ? 'IN_PROGRESS' : 'PENDING_USER'
        // أول رد علني من الموظفين فقط يُحسب في زمن الاستجابة
        if (!ticket.firstResponseAt && !dto.isInternal) update.firstResponseAt = new Date()
      }
      await tx.supportTicket.update({ where: { id }, data: update })
      return message
    })
  }

  async resolve(id: string, userId: string, role: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة')
    if (!this.isStaff(role) && ticket.userId !== userId) throw new ForbiddenException('غير مصرح')
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    })
  }

  async close(id: string, userId: string, role: string, dto: FeedbackDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة')
    if (!this.isStaff(role) && ticket.userId !== userId) throw new ForbiddenException('غير مصرح')
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 'CLOSED', closedAt: new Date(), satisfactionRating: dto.rating, satisfactionComment: dto.comment },
    })
  }

  async getStats() {
    const [total, open, resolved, avgResponse, byCategory, byStatus] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
      this.prisma.supportTicket.findMany({ where: { firstResponseAt: { not: null } }, select: { createdAt: true, firstResponseAt: true } }),
      this.prisma.supportTicket.groupBy({ by: ['category'], _count: true }),
      this.prisma.supportTicket.groupBy({ by: ['status'], _count: true }),
    ])
    const responseTimes = avgResponse.map((t) => t.firstResponseAt!.getTime() - t.createdAt.getTime())
    const avgMs = responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0
    return {
      total, open, resolved,
      avgResponseMinutes: Math.round(avgMs / 60000),
      byCategory, byStatus,
    }
  }
}
