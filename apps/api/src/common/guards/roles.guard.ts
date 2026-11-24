import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRole } from '@prisma/client'

/**
 * التحقق بالعضوية الصريحة: المستخدم يمر فقط إذا كان دوره ضمن الأدوار المذكورة
 * في @Roles(...)، أو كان SUPER_ADMIN. لا يوجد تدرج ضمني (الدور الأعلى مستوى
 * لا يرث صلاحيات أدوار أخرى غير مذكورة).
 */
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

    if (user.role === 'SUPER_ADMIN' || requiredRoles.includes(user.role as UserRole)) return true
    throw new ForbiddenException('ليس لديك الصلاحية المطلوبة')
  }
}
