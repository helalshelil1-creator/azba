import {
  IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength, IsArray, IsInt, IsBoolean,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string

  @ApiPropertyOptional({ enum: ['TECHNICAL', 'BILLING', 'INVESTMENT', 'FARM', 'VETERINARY', 'LEGAL', 'GENERAL'] })
  @IsOptional()
  @IsEnum(['TECHNICAL', 'BILLING', 'INVESTMENT', 'FARM', 'VETERINARY', 'LEGAL', 'GENERAL'])
  category?: string

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[]
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}

export class AssignTicketDto {
  @ApiProperty()
  @IsUUID()
  assigneeId: string
}

export class ReplyTicketDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean
}

export class FeedbackDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  rating: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string
}

export class TicketQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  page?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  limit?: number
}
