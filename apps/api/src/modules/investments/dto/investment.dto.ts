import {
  IsUUID, IsInt, Min, IsEnum, IsBoolean, IsOptional, IsString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaymentMethod } from '@prisma/client'

export class CreateReservationDto {
  @ApiProperty()
  @IsUUID()
  projectId: string

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  shareCount: number
}

export class ConfirmInvestmentDto {
  @ApiProperty()
  @IsUUID()
  reservationId: string

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod

  @ApiProperty()
  @IsBoolean()
  acceptContract: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerRef?: string
}

export class WithdrawalDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amount: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccount?: string
}

export class InvestmentQueryDto {
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
  status?: string
}
