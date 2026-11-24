import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AnimalsService } from './animals.service'
import {
  CreateAnimalDto, UpdateAnimalDto, RecordWeightDto, CreateHealthRecordDto,
  CreateVaccinationDto, CreateVetReportDto, AnimalQueryDto,
} from './dto/animal.dto'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animals: AnimalsService) {}

  @Get()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'VETERINARIAN', 'INVESTMENT_MANAGER', 'FINANCE_MANAGER')
  @ApiOperation({ summary: 'قائمة الحيوانات' })
  findAll(@Query() query: AnimalQueryDto) {
    return this.animals.findAll(query)
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'INVESTMENT_MANAGER')
  @ApiOperation({ summary: 'إحصائيات الحيوانات' })
  getStats() {
    return this.animals.getStats()
  }

  @Get('qr/:qr')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'البحث بالكود QR' })
  findByQR(@Param('qr') qr: string) {
    return this.animals.findByQR(qr)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ملف حيوان' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.animals.findOne(id)
  }

  @Post()
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'تسجيل حيوان' })
  create(@Body() dto: CreateAnimalDto, @CurrentUser('id') userId: string) {
    return this.animals.create(dto, userId)
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'تحديث حيوان' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnimalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.animals.update(id, dto, userId)
  }

  @Post(':id/transfer')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER')
  @ApiOperation({ summary: 'نقل حيوان' })
  transfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('penId') penId: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.animals.transfer(id, penId, userId, reason)
  }

  @Post(':id/death')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'VETERINARIAN')
  @ApiOperation({ summary: 'تسجيل وفاة' })
  recordDeath(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { date: string; cause: string; notes?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.animals.recordDeath(id, data, userId)
  }

  // ---------- Weight ----------
  @Post('weights')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'FARM_EMPLOYEE')
  @ApiOperation({ summary: 'تسجيل وزن' })
  recordWeight(@Body() dto: RecordWeightDto, @CurrentUser('id') userId: string) {
    return this.animals.recordWeight(dto, userId)
  }

  // ---------- Health ----------
  @Post('health-records')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'VETERINARIAN', 'FARM_EMPLOYEE')
  @ApiOperation({ summary: 'تسجيل حالة صحية' })
  createHealthRecord(@Body() dto: CreateHealthRecordDto, @CurrentUser('id') userId: string) {
    return this.animals.createHealthRecord(dto, userId)
  }

  @Post('vaccinations')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'VETERINARIAN')
  @ApiOperation({ summary: 'تسجيل لقاح' })
  createVaccination(@Body() dto: CreateVaccinationDto, @CurrentUser('id') userId: string) {
    return this.animals.createVaccination(dto, userId)
  }

  // ---------- Veterinary ----------
  @Post('vet-reports')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'VETERINARIAN')
  @ApiOperation({ summary: 'إنشاء تقرير بيطري' })
  createVetReport(
    @Body() dto: CreateVetReportDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.animals.createVetReport(dto, userId, role)
  }

  @Patch('vet-reports/:id/approve')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'VETERINARIAN')
  @ApiOperation({ summary: 'اعتماد تقرير بيطري' })
  approveVetReport(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.animals.approveVetReport(id, userId, role)
  }

  // ---------- Feeding ----------
  @Post('feeding')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FARM_MANAGER', 'FARM_EMPLOYEE')
  @ApiOperation({ summary: 'تسجيل تغذية' })
  recordFeed(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.animals.recordFeed(dto, userId)
  }
}
