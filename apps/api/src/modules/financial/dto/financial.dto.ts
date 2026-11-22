import {
  IsString, IsOptional, IsNumber, IsUUID, IsEnum, IsBoolean, IsDateString,
  IsArray, ValidateNested, IsInt, Min, MinLength, MaxLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'

class LedgerLineDto {
  @ApiProperty()
  @IsUUID()
  accountId: string

  @ApiProperty({ enum: ['DEBIT', 'CREDIT'] })
  @IsEnum(['DEBIT', 'CREDIT'])
  type: 'DEBIT' | 'CREDIT'

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farmId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  animalId?: string
}

export class CreateJournalEntryDto {
  @ApiProperty()
  @IsDateString()
  date: string

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  referenceId?: string

  @ApiProperty({ type: [LedgerLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LedgerLineDto)
  entries: LedgerLineDto[]
}

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string

  @ApiProperty({ enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] })
  @IsEnum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  type: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}

export class CreateExpenseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  farmId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  animalId?: string

  @ApiProperty()
  @IsUUID()
  accountId: string

  @ApiProperty({ enum: ['FEED', 'VETERINARY', 'LABOR', 'MAINTENANCE', 'UTILITIES', 'TRANSPORT', 'ADMIN', 'OTHER'] })
  @IsEnum(['FEED', 'VETERINARY', 'LABOR', 'MAINTENANCE', 'UTILITIES', 'TRANSPORT', 'ADMIN', 'OTHER'])
  category: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subCategory?: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  vatAmount?: number

  @ApiProperty()
  @IsDateString()
  expenseDate: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber?: string
}

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}

export class ExpenseApprovalDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  action: 'APPROVED' | 'REJECTED'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string
}

export class CreateDistributionDto {
  @ApiProperty()
  @IsUUID()
  projectId: string

  @ApiProperty()
  @IsDateString()
  periodStart: string

  @ApiProperty()
  @IsDateString()
  periodEnd: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  companySharePercent?: number
}
