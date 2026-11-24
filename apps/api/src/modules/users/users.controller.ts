import {
  Controller, Get, Patch, Delete, Param, Query, Body, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole, UserStatus } from '@prisma/client'
import { UsersService } from './users.service'
import { Roles } from '../../common/decorators/roles.decorator'
import { IsEnum } from 'class-validator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { AuthUser } from '../auth/jwt.strategy'

class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole
}

class UpdateStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus
}

@ApiTags('users')
@ApiBearerAuth()
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة المستخدمين' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    return this.users.findAll({ page, limit, search, role, status })
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات المستخدمين' })
  getStats() {
    return this.users.getStats()
  }

  @Get(':id')
  @ApiOperation({ summary: 'بيانات مستخدم' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findOne(id)
  }

  @Patch(':id/role')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'تغيير دور مستخدم' })
  updateRole(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto, @CurrentUser() actor: AuthUser) {
    return this.users.updateRole(id, dto.role, actor)
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'تغيير حالة مستخدم' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto, @CurrentUser() actor: AuthUser) {
    return this.users.updateStatus(id, dto.status, actor)
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'حذف مستخدم ( soft delete )' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthUser) {
    return this.users.remove(id, actor)
  }
}
