import {
  IsString, IsOptional, IsNumber, IsUUID, IsEnum, Min, MaxLength, MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class CreateFarmDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string

  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsString()
  city: string

  @ApiProperty()
  @IsString()
  governorate: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalArea?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usableArea?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  managerId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenseNumber?: string
}

export class UpdateFarmDto extends PartialType(CreateFarmDto) {}

export class CreateBuildingDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string

  @ApiProperty()
  @IsString()
  code: string

  @ApiProperty({ enum: ['PEN', 'STORAGE', 'OFFICE', 'VET_CLINIC', 'FEED_MILL', 'OTHER'] })
  @IsEnum(['PEN', 'STORAGE', 'OFFICE', 'VET_CLINIC', 'FEED_MILL', 'OTHER'])
  type: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number
}

export class UpdateBuildingDto extends PartialType(CreateBuildingDto) {}

export class CreatePenDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string

  @ApiProperty()
  @IsString()
  code: string

  @ApiProperty({
    enum: ['FATTENING', 'DAIRY', 'BREEDING', 'QUARANTINE', 'ISOLATION', 'CALVING'],
  })
  @IsEnum(['FATTENING', 'DAIRY', 'BREEDING', 'QUARANTINE', 'ISOLATION', 'CALVING'])
  type: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  buildingId?: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  capacity: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number
}

export class UpdatePenDto extends PartialType(CreatePenDto) {}

export class CreateEmployeeDto {
  @ApiProperty()
  @IsUUID()
  userId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string

  @ApiProperty({ enum: ['MANAGER', 'SUPERVISOR', 'WORKER', 'VET_TECH', 'FEED_TECH', 'MAINTENANCE'] })
  @IsEnum(['MANAGER', 'SUPERVISOR', 'WORKER', 'VET_TECH', 'FEED_TECH', 'MAINTENANCE'])
  role: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salary?: number
}
