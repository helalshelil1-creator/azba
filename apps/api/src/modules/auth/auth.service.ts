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
import { randomBytes } from 'crypto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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
      await this.prisma.session.deleteMany({ where: { userId, token: refreshToken } })
    }
    this.logger.log(`User logged out: ${userId}`)
    return { success: true }
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })
    if (!session || session.expiresAt < new Date() || session.revokedAt) {
      throw new UnauthorizedException('جلسة غير صالحة')
    }
    return this.generateTokens(session.user.id, session.user.email, session.user.role)
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
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      // Don't reveal whether email exists
      return { success: true, message: 'إذا كان البريد مسجلًا، ستصلك رسالة استعادة' }
    }
    const token = randomBytes(32).toString('hex')
    // Store token in system settings with expiry (simplified)
    await this.prisma.systemSetting.upsert({
      where: { key: `reset:${user.id}` },
      create: { key: `reset:${user.id}`, value: { token, expiresAt: Date.now() + 3600000 }, category: 'SECURITY' },
      update: { value: { token, expiresAt: Date.now() + 3600000 } },
    })
    // TODO: send email via notification service
    this.logger.log(`Password reset requested for ${user.email}`)
    return { success: true, message: 'إذا كان البريد مسجلًا، ستصلك رسالة استعادة' }
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Find the setting with matching token
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { startsWith: 'reset:' }, category: 'SECURITY' },
    })
    const match = settings.find((s) => {
      const v = s.value as { token: string; expiresAt: number }
      return v.token === dto.token && v.expiresAt > Date.now()
    })
    if (!match) throw new BadRequestException('رابط الاستعادة غير صالح أو منتهي')
    const userId = match.key.replace('reset:', '')
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.hash(dto.newPassword) },
    })
    await this.prisma.systemSetting.delete({ where: { key: match.key } })
    return { success: true }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
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
      secret: this.config.get<string>('JWT_SECRET') || 'dev-secret-change-me',
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') || '15m',
    })
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, type: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh-secret',
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d',
      },
    )
    await this.prisma.session.create({
      data: {
        userId,
        token: refreshToken,
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
