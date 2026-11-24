import {
  IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsDateString,
  IsInt, Min, MaxLength, MinLength, IsArray,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { AnimalType, HealthStatus, AnimalStatus } from '@prisma/client'

export class CreateAnimalDto {
  @ApiProperty()
  @IsUUID()
  farmId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  penId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  tagNumber: string

  @ApiProperty({ enum: AnimalType })
  @IsEnum(AnimalType)
  type: AnimalType

  @ApiProperty()
  @IsString()
  breed: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  breedEn?: string

  @ApiProperty({ enum: ['MALE', 'FEMALE'] })
  @IsEnum(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE'

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  purchaseWeight?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  purchasePrice?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  purchaseDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {}

export class RecordWeightDto {
  @ApiProperty()
  @IsUUID()
  animalId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiProperty()
  @IsNumber()
  @Min(1)
  weight: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  method?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recordedAt?: string
}

export class CreateHealthRecordDto {
  @ApiProperty()
  @IsUUID()
  animalId: string

  @ApiProperty({ enum: ['EXAMINATION', 'VACCINATION', 'MEDICATION', 'TREATMENT', 'SURGERY', 'LAB_TEST', 'CHECKUP'] })
  @IsEnum(['EXAMINATION', 'VACCINATION', 'MEDICATION', 'TREATMENT', 'SURGERY', 'LAB_TEST', 'CHECKUP'])
  recordType: string

  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  treatment?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cost?: number

  @ApiProperty()
  @IsDateString()
  startDate: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followUpDate?: string
}

export class CreateVaccinationDto {
  @ApiProperty()
  @IsUUID()
  animalId: string

  @ApiProperty()
  @IsString()
  vaccineName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vaccineType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  administeredAt?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextDueDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cost?: number
}

export class CreateVetReportDto {
  @ApiProperty()
  @IsUUID()
  animalId: string

  @ApiProperty({ enum: ['ROUTINE_CHECKUP', 'EMERGENCY', 'PRE_PURCHASE', 'PRE_SALE', 'MORTALITY', 'OUTBREAK'] })
  @IsEnum(['ROUTINE_CHECKUP', 'EMERGENCY', 'PRE_PURCHASE', 'PRE_SALE', 'MORTALITY', 'OUTBREAK'])
  reportType: string

  @ApiProperty()
  @IsDateString()
  examinationDate: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  temperature?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  heartRate?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  respiratoryRate?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  bodyConditionScore?: number

  @ApiProperty()
  @IsString()
  findings: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  treatmentPlan?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendations?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followUpDate?: string
}

export class AnimalQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  page?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  limit?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farmId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  penId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiPropertyOptional({ enum: AnimalType })
  @IsOptional()
  @IsEnum(AnimalType)
  type?: AnimalType

  @ApiPropertyOptional({ enum: HealthStatus })
  @IsOptional()
  @IsEnum(HealthStatus)
  healthStatus?: HealthStatus

  @ApiPropertyOptional({ enum: AnimalStatus })
  @IsOptional()
  @IsEnum(AnimalStatus)
  status?: AnimalStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string
}
