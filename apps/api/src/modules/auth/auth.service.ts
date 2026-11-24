import {
  Injectable, ConflictException, UnauthorizedException, BadRequestException,
  NotFoundException, Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../prisma/prisma.service'
import { RegisterDto, LoginDto, ChangePasswordDto, ResetPasswordDto, UpdateProfileDto, ForgotPasswordDto } from './dto/auth.dto'
import { AuthUser } from './jwt.strategy'
import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import { MailerService } from './mailer.service'
import { getAccessSecret, getRefreshSecret } from '../../common/config/secrets'

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex')

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
  ) {}

  private hash(password: string) {
    return bcrypt.hash(password, 12)
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, ...(dto.phone ? [{ phone: dto.phone }] : [])] },
    })
    if (existing) {
      throw new ConflictException('البريد الإلكتروني أو رقم الهاتف مسجل بالفعل')
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash: await this.hash(dto.password),
        firstName: dto.firstName,
        lastName: dto.lastName,
        preferredLang: dto.preferredLang || 'ar',
        role: 'INVESTOR',
        status: 'ACTIVE',
        investorProfile: {
          create: {},
        },
        wallet: {
          create: { currency: 'EGP', balance: 0, locked: 0 },
        },
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true, preferredLang: true, createdAt: true,
      },
    })

    this.logger.log(`New user registered: ${user.email}`)

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return { user, ...tokens }
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { investorProfile: true },
    })

    if (!user) {
      await this.logLoginAttempt(null, dto.email, ip, userAgent, false, 'USER_NOT_FOUND')
      throw new UnauthorizedException('بيانات الدخول غير صحيحة')
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('الحساب مقفل مؤقتًا، حاول لاحقًا')
    }

    if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
      throw new UnauthorizedException('الحساب معلق أو محظور، تواصل مع الدعم')
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
      })
      if (user.failedLoginAttempts + 1 >= 5) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
          },
        })
      }
      await this.logLoginAttempt(user.id, dto.email, ip, userAgent, false, 'INVALID_PASSWORD')
      throw new UnauthorizedException('بيانات الدخول غير صحيحة')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })
    await this.logLoginAttempt(user.id, dto.email, ip, userAgent, true)

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    const safeUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: !!user.emailVerified,
      preferredLang: user.preferredLang,
      avatar: user.avatar,
      phone: user.phone,
    }
    return { user: safeUser, ...tokens }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.session.deleteMany({ where: { userId, token: sha256(refreshToken) } })
    }
    this.logger.log(`User logged out: ${userId}`)
    return { success: true }
  }

  async refresh(refreshToken: string) {
    const invalid = () => new UnauthorizedException('جلسة غير صالحة')
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; type?: string }>(refreshToken, {
        secret: getRefreshSecret(this.config),
      })
      if (payload.type !== 'refresh') throw invalid()
    } catch {
      throw invalid()
    }

    const session = await this.prisma.session.findUnique({
      where: { token: sha256(refreshToken) },
      include: { user: true },
    })
    if (!session) throw invalid()
    if (session.revokedAt) {
      // رمز قديم أُعيد استخدامه: نفترض احتمال سرقته ونُنهي كل جلسات المستخدم
      await this.prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      throw invalid()
    }
    if (session.expiresAt < new Date()) throw invalid()
    const u = session.user
    if (u.deletedAt || u.status === 'SUSPENDED' || u.status === 'BLOCKED' || u.status === 'INACTIVE') {
      throw invalid()
    }

    // تدوير: نُبطل الرمز الحالي مرة واحدة فقط (يمنع الاستخدام المتزامن المزدوج)
    const claimed = await this.prisma.session.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    if (claimed.count !== 1) throw invalid()
    return this.generateTokens(u.id, u.email, u.role)
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('المستخدم غير موجود')
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!valid) throw new BadRequestException('كلمة المرور الحالية غير صحيحة')
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.hash(dto.newPassword) },
    })
    // Revoke all sessions
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return { success: true }
  }

  async forgotPassword(email: string) {
    const generic = { success: true, message: 'إذا كان البريد مسجلًا، ستصلك رسالة استعادة' }
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user || user.deletedAt) return generic

    const secret = randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 3600000
    // نخزن بصمة الرمز فقط، والرمز نفسه يصل المستخدم بالبريد
    await this.prisma.systemSetting.upsert({
      where: { key: `reset:${user.id}` },
      create: { key: `reset:${user.id}`, value: { tokenHash: sha256(secret), expiresAt }, category: 'SECURITY' },
      update: { value: { tokenHash: sha256(secret), expiresAt } },
    })

    const base = (
      this.config.get<string>('APP_URL') ||
      (this.config.get<string>('CORS_ORIGINS') || 'http://localhost:3000').split(',')[0]
    ).replace(/\/+$/, '')
    const link = `${base}/reset-password?token=${user.id}.${secret}`
    const sent = await this.mailer.send(
      user.email,
      'استعادة كلمة المرور - عزبة',
      `لإعادة تعيين كلمة المرور افتح الرابط التالي (صالح لمدة ساعة):\n${link}\n\nإذا لم تطلب ذلك تجاهل هذه الرسالة.`,
    )
    this.logger.log(`Password reset requested for ${user.id} (email ${sent ? 'sent' : 'not sent'})`)
    return generic
  }

  async resetPassword(dto: ResetPasswordDto) {
    const bad = () => new BadRequestException('رابط الاستعادة غير صالح أو منتهي')
    const dot = dto.token.indexOf('.')
    if (dot < 1) throw bad()
    const userId = dto.token.slice(0, dot)
    const secret = dto.token.slice(dot + 1)

    const setting = await this.prisma.systemSetting.findUnique({ where: { key: `reset:${userId}` } })
    if (!setting) throw bad()
    const v = setting.value as { tokenHash?: string; expiresAt?: number }
    if (!v?.tokenHash || !v.expiresAt || v.expiresAt < Date.now()) throw bad()
    const a = Buffer.from(sha256(secret), 'hex')
    const b = Buffer.from(v.tokenHash, 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw bad()

    // استهلاك الرمز مرة واحدة
    const consumed = await this.prisma.systemSetting.deleteMany({ where: { key: setting.key } })
    if (consumed.count !== 1) throw bad()

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.hash(dto.newPassword), failedLoginAttempts: 0, lockedUntil: null },
    })
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return { success: true }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const email = dto.email?.toLowerCase()
    if (email || dto.phone) {
      const clash = await this.prisma.user.findFirst({
        where: {
          id: { not: userId },
          OR: [...(email ? [{ email }] : []), ...(dto.phone ? [{ phone: dto.phone }] : [])],
        },
        select: { id: true },
      })
      if (clash) throw new ConflictException('البريد الإلكتروني أو رقم الهاتف مسجل بالفعل')
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.preferredLang && { preferredLang: dto.preferredLang }),
        ...(dto.email && { email: dto.email.toLowerCase() }),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true, preferredLang: true, phone: true, avatar: true,
      },
    })
    return user
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { investorProfile: true, wallet: true },
    })
    if (!user) throw new NotFoundException('المستخدم غير موجود')
    const { passwordHash, ...safe } = user
    return safe
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    const accessToken = await this.jwt.signAsync(payload, {
      secret: getAccessSecret(this.config),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') || '15m',
    })
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, type: 'refresh', jti: randomBytes(16).toString('hex') },
      {
        secret: getRefreshSecret(this.config),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d',
      },
    )
    await this.prisma.session.create({
      data: {
        userId,
        token: sha256(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    }
  }

  private async logLoginAttempt(
    userId: string | null,
    email: string,
    ip?: string,
    userAgent?: string,
    success = false,
    failureReason?: string,
  ) {
    try {
      await this.prisma.loginAttempt.create({
        data: { userId, email, ipAddress: ip || 'unknown', userAgent, success, failureReason },
      })
    } catch {
      // non-blocking
    }
  }
}
