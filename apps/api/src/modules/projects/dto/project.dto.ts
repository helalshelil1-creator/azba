import {
  IsString, IsOptional, IsNumber, IsEnum, IsInt, Min, Max,
  IsDateString, IsArray, IsUUID, MinLength, MaxLength, ArrayMinSize,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { AnimalType, ProjectStatus, RiskLevel } from '@prisma/client'

export class CreateProjectDto {
  @ApiProperty()
  @IsUUID()
  farmId: string

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameEn?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: AnimalType })
  @IsEnum(AnimalType)
  animalType: AnimalType

  @ApiProperty()
  @IsString()
  breed: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  breedEn?: string

  @ApiProperty({ enum: ['FATTENING', 'DAIRY', 'BREEDING', 'RESALE'] })
  @IsEnum(['FATTENING', 'DAIRY', 'BREEDING', 'RESALE'])
  purpose: 'FATTENING' | 'DAIRY' | 'BREEDING' | 'RESALE'

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedEndDate?: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100000)
  totalShares: number

  @ApiProperty()
  @IsNumber()
  @Min(1)
  sharePrice: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  minSharesPerInvestor?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSharesPerInvestor?: number

  @ApiProperty()
  @IsNumber()
  @Min(1)
  totalBudget: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  expectedReturnRate?: number

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  riskDisclosure?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  animalIds?: string[]
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class PublishProjectDto {
  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status: ProjectStatus
}

export class ProjectQueryDto {
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
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: AnimalType })
  @IsOptional()
  @IsEnum(AnimalType)
  animalType?: AnimalType

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string
}
