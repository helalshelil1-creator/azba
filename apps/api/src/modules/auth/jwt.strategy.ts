import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  emailVerified: boolean
  preferredLang: string
  avatar?: string | null
  phone?: string | null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          if (req?.cookies?.access_token) return req.cookies.access_token
          if (req?.headers?.authorization?.startsWith('Bearer ')) {
            return req.headers.authorization.slice(7)
          }
          return null
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev-secret-change-me',
    })
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true, emailVerified: true,
        preferredLang: true, avatar: true, phone: true,
      },
    })
    if (!user) throw new UnauthorizedException('المستخدم غير موجود')
    if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
      throw new UnauthorizedException('الحساب معلق أو محظور')
    }
    return {
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
  }
}
