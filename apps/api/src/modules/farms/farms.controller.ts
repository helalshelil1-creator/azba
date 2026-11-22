import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { FarmsService } from './farms.service'
import {
  CreateFarmDto, UpdateFarmDto, CreateBuildingDto, UpdateBuildingDto,
  CreatePenDto, UpdatePenDto, CreateEmployeeDto,
} from './dto/farm.dto'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('farms')
@Controller('farms')
export class FarmsController {
  constructor(private readonly farms: FarmsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'قائمة المزارع' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.farms.findAll({ page, limit, search })
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER', 'FARM_MANAGER')
  @ApiOperation({ summary: 'إحصائيات المزارع' })
  getStats() {
    return this.farms.getStats()
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل مزرعة' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.farms.findOne(id)
  }

  @Post()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER')
  @ApiOperation({ summary: 'إنشاء مزرعة' })
  create(@Body() dto: CreateFarmDto, @CurrentUser('id') userId: string) {
    return this.farms.create(dto, userId)
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVESTMENT_MANAGER', 'FARM_MANAGER')
  @ApiOperation({ summary: 'تحديث مزرعة' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFarmDto) {
    return this.farms.update(id, dto)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'حذف مزرعة' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.farms.remove(id)
  }

  // ---------- Buildings ----------
  @Post(':id/buildings')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'إضافة مبنى' })
  createBuilding(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateBuildingDto) {
    return this.farms.createBuilding(id, dto)
  }

  @Patch('buildings/:buildingId')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'تحديث مبنى' })
  updateBuilding(@Param('buildingId', ParseUUIDPipe) buildingId: string, @Body() dto: UpdateBuildingDto) {
    return this.farms.updateBuilding(buildingId, dto)
  }

  // ---------- Pens ----------
  @Post(':id/pens')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'إضافة حظيرة' })
  createPen(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreatePenDto) {
    return this.farms.createPen(id, dto)
  }

  @Patch('pens/:penId')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'تحديث حظيرة' })
  updatePen(@Param('penId', ParseUUIDPipe) penId: string, @Body() dto: UpdatePenDto) {
    return this.farms.updatePen(penId, dto)
  }

  @Delete('pens/:penId')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'حذف حظيرة' })
  removePen(@Param('penId', ParseUUIDPipe) penId: string) {
    return this.farms.removePen(penId)
  }

  // ---------- Employees ----------
  @Post(':id/employees')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'إضافة موظف' })
  addEmployee(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateEmployeeDto) {
    return this.farms.addEmployee(id, dto)
  }

  @Delete('employees/:employeeId')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'إنهاء خدمة موظف' })
  removeEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.farms.removeEmployee(employeeId)
  }
}
