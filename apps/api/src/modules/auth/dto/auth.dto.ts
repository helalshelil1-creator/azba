import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsEnum, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'investor@example.com' })
  @IsEmail()
  email: string

  @ApiPropertyOptional({ example: '01001234567' })
  @IsOptional()
  @IsString()
  @Matches(/^(\+?2)?01[0-9]{9}$/, { message: 'رقم الهاتف غير صالح' })
  phone?: string

  @ApiProperty({ example: 'StrongPass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/, { message: 'كلمة المرور يجب أن تحتوي على حرف كبير' })
  @Matches(/[a-z]/, { message: 'كلمة المرور يجب أن تحتوي على حرف صغير' })
  @Matches(/[0-9]/, { message: 'كلمة المرور يجب أن تحتوي على رقم' })
  password: string

  @ApiProperty({ example: 'أحمد' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string

  @ApiProperty({ example: 'محمد' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string

  @ApiPropertyOptional({ enum: ['ar', 'en'] })
  @IsOptional()
  @IsEnum(['ar', 'en'])
  preferredLang?: 'ar' | 'en'
}

export class LoginDto {
  @ApiProperty({ example: 'investor@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'StrongPass123' })
  @IsString()
  password: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  remember?: boolean
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  token: string
}

export class UpdateProfileDto extends PartialType(RegisterDto) {}
