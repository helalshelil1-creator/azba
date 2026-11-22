import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRole } from '@prisma/client'

const ROLE_LEVEL: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  FINANCE_MANAGER: 80,
  INVESTMENT_MANAGER: 80,
  ACCOUNTANT: 70,
  FARM_MANAGER: 70,
  SALES_MANAGER: 70,
  PROCUREMENT_OFFICER: 60,
  VETERINARIAN: 60,
  CUSTOMER_SUPPORT: 50,
  FARM_EMPLOYEE: 40,
  INVESTOR: 10,
  SUPPORT_AGENT: 50,
  SUPPORT_MANAGER: 80,
  VIEWER: 5,
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) throw new ForbiddenException('غير مصرح')

    const userLevel = ROLE_LEVEL[user.role as UserRole] ?? 0
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_LEVEL[r] ?? 0))

    if (userLevel < minRequired) {
      throw new ForbiddenException('ليس لديك الصلاحية المطلوبة')
    }
    return true
  }
}
